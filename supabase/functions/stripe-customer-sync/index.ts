import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, json } from "../_shared/http.ts";
import { customerFields, stripe } from "../_shared/stripe.ts";

// Called by the clients trigger through pg_net (verify_jwt = false), authenticated by the shared
// notify_hook_secret: copies the client's company name, phone and address to their Stripe customer.
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const admin = adminClient();

  const { data: cfg } = await admin.from("portal_config").select("value").eq("key", "notify_hook_secret").single();
  if (!cfg?.value || req.headers.get("x-notify-secret") !== cfg.value) return json({ error: "Unauthorized" }, 401);

  const { client_id } = await req.json().catch(() => ({}));
  const { data: c } = await admin.from("clients").select("*").eq("id", client_id).single();
  if (!c?.stripe_customer_id) return json({ ok: true, skipped: true });

  try {
    await stripe("POST", `/customers/${c.stripe_customer_id}`, customerFields(c));
    return json({ ok: true });
  } catch (err) {
    console.error("stripe-customer-sync error:", (err as Error).message);
    return json({ error: "sync failed" }, 500);
  }
});
