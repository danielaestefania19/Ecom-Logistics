import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, corsHeaders, json, triggerAsanaSync, userCanAccessOrder } from "../_shared/http.ts";
import { applyTracker, createTracker, EASYPOST_API_KEY } from "../_shared/easypost.ts";

// Registers every not-yet-registered tracking number of an order with EasyPost.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { order_id } = await req.json();
    if (!order_id) return json({ error: "order_id is required" }, 400);
    if (!(await userCanAccessOrder(req, order_id))) return json({ error: "Forbidden" }, 403);
    if (!EASYPOST_API_KEY) return json({ configured: false });

    const admin = adminClient();
    const { data: shipments, error } = await admin
      .from("shipments_inbound")
      .select("id, tracking_number")
      .eq("order_id", order_id)
      .is("provider_tracker_id", null);
    if (error) throw new Error(error.message);

    const results = [];
    let anyDelivered = false;
    for (const s of shipments ?? []) {
      try {
        const tracker = await createTracker(s.tracking_number);
        const { status } = await applyTracker(admin, [s.id], tracker);
        anyDelivered ||= status === "delivered";
        results.push({ tracking_number: s.tracking_number, status });
      } catch (err) {
        results.push({ tracking_number: s.tracking_number, error: (err as Error).message });
      }
    }

    if (anyDelivered) {
      const { data: moved } = await admin.rpc("mark_order_delivered", { p_order: order_id });
      if (moved) await triggerAsanaSync(order_id);
    }

    return json({ configured: true, results });
  } catch (err) {
    console.error("tracking-register error:", (err as Error).message);
    return json({ error: (err as Error).message }, 500);
  }
});
