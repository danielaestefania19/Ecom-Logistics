import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, corsHeaders, isServiceCall, json, userCanAccessOrder } from "../_shared/http.ts";

const ASANA_PAT = Deno.env.get("ASANA_PAT") ?? "";
const PORTAL_ORDER_URL = "https://ecomlogisticsus.com/portal/orders";

const STAGE_ES: Record<string, string> = {
  quote: "Cotización",
  awaiting_inventory: "Esperando mercancía",
  received: "Recibida (conteo)",
  discrepancy: "Discrepancia",
  scheduled: "Programada",
  prepped: "Preparada",
  in_storage: "En storage",
  shipped: "Enviada a Amazon",
  invoiced: "Facturada",
  paid: "Pagada",
  cancelled: "Cancelada",
};

async function asana(method: string, path: string, data?: unknown) {
  const res = await fetch(`https://app.asana.com/api/1.0${path}`, {
    method,
    headers: { Authorization: `Bearer ${ASANA_PAT}`, "Content-Type": "application/json", Accept: "application/json" },
    body: data ? JSON.stringify({ data }) : undefined,
  });
  if (!res.ok) throw new Error(`Asana ${method} ${path}: ${res.status} ${await res.text()}`);
  return (await res.json()).data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { order_id } = await req.json();
    if (!order_id) return json({ error: "order_id is required" }, 400);

    // Clients trigger this right after creating an order, staff after stage changes, functions internally.
    if (!isServiceCall(req) && !(await userCanAccessOrder(req, order_id))) {
      return json({ error: "Forbidden" }, 403);
    }
    if (!ASANA_PAT) return json({ skipped: "ASANA_PAT not configured" });

    const admin = adminClient();
    const { data: cfgRow } = await admin.from("portal_config").select("value").eq("key", "asana_mirror").single();
    if (!cfgRow?.value) return json({ skipped: "asana_mirror not configured" });
    const cfg = JSON.parse(cfgRow.value) as { project_gid: string; sections: Record<string, string> };

    const { data: order, error } = await admin
      .from("orders")
      .select(`id, order_number, stage, ship_method, shipment_creator, eta, prep_day, total_cases, pallets,
               invoice_number, estimated_cost, asana_task_gid,
               clients(company, full_name, email),
               order_items(sku, expected_qty, received_qty, prep_type),
               shipments_inbound(tracking_number, carrier, status)`)
      .eq("id", order_id)
      .single();
    if (error || !order) return json({ error: error?.message ?? "order not found" }, 404);

    const client = (order.clients ?? {}) as { company?: string; full_name?: string; email?: string };
    const items = (order.order_items ?? []) as Array<{ sku: string; expected_qty: number; received_qty: number | null; prep_type: string }>;
    const shipments = (order.shipments_inbound ?? []) as Array<{ tracking_number: string; carrier: string | null; status: string }>;
    const units = items.reduce((n, i) => n + i.expected_qty, 0);

    const name = `#${order.order_number} · ${client.company || client.email || "Cliente"} · PREP · ${units} u`;
    const notes = [
      `Etapa: ${STAGE_ES[order.stage] ?? order.stage}`,
      `Cliente: ${client.company ?? "—"} (${client.full_name ?? "—"}, ${client.email ?? "—"})`,
      `Llegada estimada: ${order.eta ?? "—"} · Día de prep: ${order.prep_day ?? "—"}`,
      `Envío a Amazon: ${String(order.ship_method).toUpperCase()} · Shipment creado por: ${order.shipment_creator}`,
      `Cajas: ${order.total_cases} · Pallets: ${order.pallets}`,
      `Factura: ${order.invoice_number ?? "—"} · Estimado: ${order.estimated_cost != null ? `$${order.estimated_cost}` : "—"}`,
      "",
      "SKUs:",
      ...items.map((i) => `  • ${i.sku} — ${i.expected_qty} u (${i.prep_type})${i.received_qty != null ? ` · recibidas ${i.received_qty}` : ""}`),
      "",
      "Tracking:",
      ...(shipments.length ? shipments.map((s) => `  • ${s.tracking_number} ${s.carrier ?? ""} — ${s.status}`) : ["  —"]),
      "",
      `Portal: ${PORTAL_ORDER_URL}/${order.id}`,
      "Espejo automático: los cambios se hacen en el portal.",
    ].join("\n");
    const completed = order.stage === "paid" || order.stage === "cancelled";
    const sectionGid = cfg.sections[order.stage];

    let taskGid = order.asana_task_gid as string | null;
    if (!taskGid) {
      const task = await asana("POST", "/tasks", {
        name,
        notes,
        completed,
        memberships: [{ project: cfg.project_gid, section: sectionGid }],
      });
      taskGid = task.gid;
      await admin.from("orders").update({ asana_task_gid: taskGid }).eq("id", order.id);
    } else {
      await asana("PUT", `/tasks/${taskGid}`, { name, notes, completed });
      if (sectionGid) await asana("POST", `/sections/${sectionGid}/addTask`, { task: taskGid });
    }

    return json({ ok: true, task_gid: taskGid });
  } catch (err) {
    console.error("asana-sync error:", (err as Error).message);
    return json({ error: (err as Error).message }, 500);
  }
});
