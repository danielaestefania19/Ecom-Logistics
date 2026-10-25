import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, corsHeaders, json } from "../_shared/http.ts";
import { getCaller, isStaffRole } from "../_shared/auth.ts";
import { SpApiError, spapiFetch } from "../_shared/spapi.ts";

// SP-API Fulfillment Inbound v2024-03-20 base path
const INBOUND = "/inbound/fba/2024-03-20";

interface InboundBody {
  step: string;
  connectionId: string;
  planId?: string;      // uuid of amazon_inbound_plans row (absent on first 'create' call)
  orderId?: string;     // uuid of orders row (used when creating a plan from an order)
  payload?: Record<string, unknown>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function pollOperation(connectionId: string, operationId: string, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await spapiFetch<{ operationStatus: string; operationProblems?: unknown[] }>(
      connectionId,
      `${INBOUND}/operations/${operationId}`
    );
    if (res.operationStatus === "SUCCESS") return res;
    if (res.operationStatus === "FAILED") throw new Error(`Operation ${operationId} FAILED`);
    await sleep(1500 * (i + 1));
  }
  throw new Error(`Operation ${operationId} timed out`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const caller = await getCaller(req);
    if (!caller || !isStaffRole(caller.role)) return json({ error: "Staff only" }, 403);

    const body: InboundBody = await req.json();
    const { step, connectionId, orderId, payload = {} } = body;
    let { planId } = body;

    if (!step || !connectionId) return json({ error: "step and connectionId required" }, 400);

    const admin = adminClient();

    // ── CREATE: start a new plan ──────────────────────────────────────────────
    if (step === "create") {
      if (!orderId) return json({ error: "orderId required for step 'create'" }, 400);

      // Load order items (SKU, FNSKU, qty)
      const { data: items, error: itemErr } = await admin
        .from("order_items")
        .select("sku, fnsku, expected_qty, prep_type")
        .eq("order_id", orderId);
      if (itemErr || !items?.length) return json({ error: "No order items found" }, 400);

      // Load client ID from order
      const { data: order } = await admin.from("orders").select("client_id").eq("id", orderId).single();
      if (!order) return json({ error: "Order not found" }, 404);

      // Build SP-API request body
      const msku_items = items.map((it) => ({
        msku: it.sku,
        fnsku: it.fnsku ?? it.sku,
        quantity: it.expected_qty,
        prepOwner: "AMAZON",           // or SELLER — adjustable
        labelOwner: "AMAZON",
      }));

      const createRes = await spapiFetch<{ inboundPlanId?: string; operationId?: string }>(
        connectionId,
        `${INBOUND}/inboundPlans`,
        {
          method: "POST",
          body: {
            destinationMarketplaces: [(payload.marketplaceId as string) ?? "ATVPDKIKX0DER"],
            items: msku_items,
            name: `Order ${orderId.slice(0, 8)}`,
            sourceAddress: {
              name: "Ecom Logistics",
              addressLine1: "26250 Industrial Blvd",
              city: "Hayward",
              stateOrProvinceCode: "CA",
              postalCode: "94545",
              countryCode: "US",
            },
          },
        }
      );

      // Insert plan row
      const { data: plan, error: planErr } = await admin
        .from("amazon_inbound_plans")
        .insert({
          client_id: order.client_id,
          connection_id: connectionId,
          order_id: orderId,
          inbound_plan_id: createRes.inboundPlanId ?? null,
          operation_id: createRes.operationId ?? null,
          current_step: createRes.operationId ? "await_create" : "packing_options",
          status: createRes.operationId ? "in_progress" : "pending",
        })
        .select()
        .single();

      if (planErr) throw planErr;
      return json({ plan });
    }

    // All remaining steps require planId
    if (!planId) return json({ error: "planId required" }, 400);

    const { data: plan, error: planFetchErr } = await admin
      .from("amazon_inbound_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planFetchErr || !plan) return json({ error: "Plan not found" }, 404);

    const update = (fields: Record<string, unknown>) =>
      admin.from("amazon_inbound_plans").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", planId);

    // ── POLL: check async operation status ────────────────────────────────────
    if (step === "poll") {
      if (!plan.operation_id) return json({ plan });
      const opRes = await spapiFetch<{ operationStatus: string }>(
        connectionId,
        `${INBOUND}/operations/${plan.operation_id}`
      );
      if (opRes.operationStatus === "SUCCESS") {
        const nextStep = nextStepAfter(plan.current_step);
        await update({ operation_id: null, current_step: nextStep, status: "pending" });
        return json({ done: true, next_step: nextStep });
      }
      if (opRes.operationStatus === "FAILED") {
        await update({ status: "error", error: "Operation failed on Amazon side" });
        return json({ done: true, status: "error" });
      }
      return json({ done: false, operationStatus: opRes.operationStatus });
    }

    // ── PACKING_OPTIONS: generate them ───────────────────────────────────────
    if (step === "packing_options") {
      const res = await spapiFetch<{ operationId?: string; packingOptions?: unknown[] }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/packingOptions`,
        { method: "POST", body: {} }
      );
      if (res.operationId) {
        await update({ operation_id: res.operationId, current_step: "await_packing", status: "in_progress" });
        // Poll until done
        await pollOperation(connectionId, res.operationId);
      }
      // List options
      const opts = await spapiFetch<{ packingOptions?: unknown[] }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/packingOptions`
      );
      await update({ operation_id: null, current_step: "set_packing", status: "pending", payload: { ...plan.payload, packing_options: opts.packingOptions } });
      return json({ packing_options: opts.packingOptions });
    }

    // ── SET_PACKING: confirm option + submit box info ──────────────────────────
    if (step === "set_packing") {
      const { packingOptionId, boxes } = payload as { packingOptionId: string; boxes: unknown[] };
      if (!packingOptionId) return json({ error: "packingOptionId required" }, 400);

      // Get packing groups for this option
      const groupsRes = await spapiFetch<{ packingGroups?: { packingGroupId: string }[] }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/packingOptions/${packingOptionId}/packingGroups`
      );
      const groupId = groupsRes.packingGroups?.[0]?.packingGroupId;

      if (groupId && boxes?.length) {
        await spapiFetch(
          connectionId,
          `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/packingGroups/${groupId}/packingInformation`,
          { method: "POST", body: { boxes } }
        );
      }

      const confirmRes = await spapiFetch<{ operationId?: string }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/packingOptions/${packingOptionId}/confirmation`,
        { method: "POST", body: {} }
      );
      if (confirmRes.operationId) await pollOperation(connectionId, confirmRes.operationId);

      await update({ current_step: "placement_options", status: "pending", payload: { ...plan.payload, packing_option_id: packingOptionId } });
      return json({ ok: true });
    }

    // ── PLACEMENT_OPTIONS: generate them ─────────────────────────────────────
    if (step === "placement_options") {
      const res = await spapiFetch<{ operationId?: string }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/placementOptions`,
        { method: "POST", body: {} }
      );
      if (res.operationId) {
        await update({ operation_id: res.operationId, current_step: "await_placement", status: "in_progress" });
        await pollOperation(connectionId, res.operationId);
      }
      const opts = await spapiFetch<{ placementOptions?: unknown[] }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/placementOptions`
      );
      await update({ operation_id: null, current_step: "confirm_placement", status: "pending", payload: { ...plan.payload, placement_options: opts.placementOptions } });
      return json({ placement_options: opts.placementOptions });
    }

    // ── CONFIRM_PLACEMENT ─────────────────────────────────────────────────────
    if (step === "confirm_placement") {
      const { placementOptionId } = payload as { placementOptionId: string };
      if (!placementOptionId) return json({ error: "placementOptionId required" }, 400);

      const res = await spapiFetch<{ operationId?: string }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/placementOptions/${placementOptionId}/confirmation`,
        { method: "POST", body: {} }
      );
      if (res.operationId) await pollOperation(connectionId, res.operationId);

      await update({ current_step: "transport_options", status: "pending", payload: { ...plan.payload, placement_option_id: placementOptionId } });
      return json({ ok: true });
    }

    // ── TRANSPORT_OPTIONS: generate them ─────────────────────────────────────
    if (step === "transport_options") {
      const { shipmentIds } = payload as { shipmentIds?: string[] };
      const res = await spapiFetch<{ operationId?: string }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/transportationOptions`,
        { method: "POST", body: { shipmentIds: shipmentIds ?? [] } }
      );
      if (res.operationId) {
        await update({ operation_id: res.operationId, current_step: "await_transport", status: "in_progress" });
        await pollOperation(connectionId, res.operationId);
      }
      const opts = await spapiFetch<{ transportationOptions?: unknown[] }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/transportationOptions`
      );
      await update({ operation_id: null, current_step: "confirm_transport", status: "pending", payload: { ...plan.payload, transport_options: opts.transportationOptions } });
      return json({ transportation_options: opts.transportationOptions });
    }

    // ── CONFIRM_TRANSPORT ─────────────────────────────────────────────────────
    if (step === "confirm_transport") {
      const { transportationOptionId, shipmentId } = payload as { transportationOptionId: string; shipmentId: string };
      if (!transportationOptionId) return json({ error: "transportationOptionId required" }, 400);

      const res = await spapiFetch<{ operationId?: string }>(
        connectionId,
        `${INBOUND}/inboundPlans/${plan.inbound_plan_id}/transportationOptions/confirmation`,
        {
          method: "POST",
          body: { transportationSelections: [{ shipmentId, transportationOptionId }] },
        }
      );
      if (res.operationId) await pollOperation(connectionId, res.operationId);

      // Mark plan done
      await update({ current_step: "done", status: "completed", operation_id: null });

      // Update the linked prep order's shipment_creator
      if (plan.order_id) {
        await admin
          .from("orders")
          .update({ shipment_creator: "ecom_api" })
          .eq("id", plan.order_id);
      }

      return json({ ok: true, status: "completed" });
    }

    return json({ error: `Unknown step: ${step}` }, 400);
  } catch (err) {
    if (err instanceof SpApiError) return json({ error: err.message }, err.status);
    console.error("amazon-inbound error:", (err as Error).message);
    return json({ error: "Internal error" }, 500);
  }
});

function nextStepAfter(current: string): string {
  const seq = [
    "create", "await_create", "packing_options", "await_packing",
    "set_packing", "placement_options", "await_placement", "confirm_placement",
    "transport_options", "await_transport", "confirm_transport", "done",
  ];
  const i = seq.indexOf(current);
  return seq[i + 1] ?? "done";
}
