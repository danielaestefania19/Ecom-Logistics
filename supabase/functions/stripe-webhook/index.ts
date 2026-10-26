import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, json, triggerAsanaSync } from "../_shared/http.ts";
import { verifyStripeSignature } from "../_shared/stripe.ts";

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const HANDLED = new Set(["invoice.finalized", "invoice.paid"]);

// Called by Stripe (verify_jwt = false), authenticated by the Stripe-Signature header.
// Finalizing a shipped order's invoice marks it invoiced; paying it marks it paid.
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!WEBHOOK_SECRET) return json({ error: "STRIPE_WEBHOOK_SECRET is not set" }, 500);

  const payload = await req.text();
  const valid = await verifyStripeSignature(payload, req.headers.get("Stripe-Signature") ?? "", WEBHOOK_SECRET);
  if (!valid) return json({ error: "invalid signature" }, 400);

  const event = JSON.parse(payload);
  if (!HANDLED.has(event.type)) return json({ ok: true, ignored: event.type });

  const invoice = event.data?.object ?? {};
  const { data: orderIds, error } = await adminClient().rpc("apply_stripe_invoice", {
    p_invoice: invoice.id,
    p_event: event.type,
    p_number: invoice.number ?? null,
    p_url: invoice.hosted_invoice_url ?? null,
  });
  if (error) {
    console.error("stripe-webhook error:", error.message);
    return json({ error: "could not apply the event" }, 500);
  }

  for (const id of (orderIds ?? []) as string[]) await triggerAsanaSync(id);
  return json({ ok: true, orders: orderIds?.length ?? 0 });
});
