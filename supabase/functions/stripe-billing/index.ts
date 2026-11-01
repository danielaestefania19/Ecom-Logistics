import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminClient, corsHeaders, json, SUPABASE_URL } from "../_shared/http.ts";
import { ensureStripeCustomer, stripe } from "../_shared/stripe.ts";

const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const DAYS_UNTIL_DUE = 7;

type Line = { key: string | null; description: string; quantity: number; unit_amount: number };

// Staff-only Stripe actions: link a client to a Stripe customer, or draft an order's invoice.
// Drafts are never sent from here; staff review and send them in Stripe.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: staff } = await userClient.rpc("is_staff");
    if (staff !== true) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const admin = adminClient();

    if (body.action === "ensure_customer") {
      if (!body.client_id) return json({ error: "client_id is required" }, 400);
      const customer = await ensureStripeCustomer(admin, body.client_id);
      return json({ ok: true, customer_id: customer.id, created: customer.created });
    }

    // Read-only view of the Stripe catalog: quotes take their prices from it, and `mapping` says
    // which product each portal billing line (prep_standard, case_receiving…) uses.
    if (body.action === "catalog") {
      const [products, prices, mapping] = await Promise.all([
        listAll("/products"),
        listAll("/prices"),
        productMap(admin),
      ]);
      return json({
        mapping,
        products: products.map((p: any) => ({
          id: p.id,
          name: p.name,
          default_price: typeof p.default_price === "string" ? p.default_price : p.default_price?.id ?? null,
          prices: prices
            .filter((pr: any) => pr.product === p.id)
            .map((pr: any) => ({ id: pr.id, unit_amount_decimal: pr.unit_amount_decimal, recurring: !!pr.recurring, nickname: pr.nickname })),
        })),
      });
    }

    if (body.action === "create_invoice_draft") {
      const lines = validLines(body.lines);
      if (!body.order_id || !lines) return json({ error: "order_id and at least one valid line are required" }, 400);

      const { data: order } = await admin
        .from("orders")
        .select("id, order_number, type, client_id, stripe_invoice_id")
        .eq("id", body.order_id)
        .single();
      if (!order) return json({ error: "order not found" }, 404);
      if (order.stripe_invoice_id) return json({ error: "this order already has a Stripe invoice", invoice_id: order.stripe_invoice_id }, 409);

      const customer = await ensureStripeCustomer(admin, order.client_id);
      const service = order.type === "3pl" ? "3PL" : "FBA Prep";
      const invoice = await stripe("POST", "/invoices", {
        customer: customer.id,
        collection_method: "send_invoice",
        days_until_due: DAYS_UNTIL_DUE,
        auto_advance: false,
        pending_invoice_items_behavior: "exclude",
        description: `Order #${order.order_number} · ${service}`,
        metadata: { portal_order_id: order.id, order_number: order.order_number },
      });
      // Lines map to the existing Stripe products (portal_config.stripe_products, or a product picked
      // in the quote) at this order's price, so drafts read "PREP - BASIC STANDARD · 1249 × $0.50"
      // and Stripe reports by product. When that price already exists in Stripe it is reused as is;
      // otherwise Stripe keeps a one-off price on the same product. No products are created.
      const [productFor, prices] = await Promise.all([productMap(admin), listAll("/prices")]);
      const existingPrice = (product: string, cents: number) =>
        prices.find((p: any) => p.product === product && !p.recurring && Number(p.unit_amount_decimal) === cents)?.id;
      for (const l of lines) {
        const product = l.key?.startsWith("prod_") ? l.key : l.key && productFor[l.key];
        const price = product && existingPrice(product, l.unit_amount);
        // A quote discount (negative) or a fractional quantity goes to Stripe as one flat amount.
        const item = l.unit_amount < 0 || !Number.isInteger(l.quantity)
          ? {
              currency: "usd",
              amount: Math.round(l.quantity * l.unit_amount),
              description: l.quantity === 1 ? l.description : `${l.description} (${l.quantity} × $${(l.unit_amount / 100).toFixed(2)})`,
            }
          : {
              quantity: l.quantity,
              ...(price
                ? { price }
                : product
                ? { price_data: { currency: "usd", product, unit_amount_decimal: l.unit_amount } }
                : { currency: "usd", unit_amount_decimal: l.unit_amount, description: l.description }),
            };
        await stripe("POST", "/invoiceitems", { customer: customer.id, invoice: invoice.id, ...item });
      }

      // Link right away so a second click can't draft a duplicate.
      const { error } = await admin.from("orders").update({ stripe_invoice_id: invoice.id }).eq("id", order.id);
      if (error) throw new Error(error.message);

      return json({ ok: true, invoice_id: invoice.id, dashboard_url: dashboardUrl(invoice) });
    }

    return json({ error: "unknown action" }, 400);
  } catch (err) {
    console.error("stripe-billing error:", (err as Error).message);
    return json({ error: (err as Error).message }, 500);
  }
});

// Every active object of a Stripe list endpoint, following its pages.
async function listAll(path: string): Promise<any[]> {
  const all: any[] = [];
  let startingAfter: string | undefined;
  for (let page = 0; page < 10; page++) {
    const res = await stripe("GET", path, { active: true, limit: 100, starting_after: startingAfter });
    all.push(...res.data);
    if (!res.has_more || !res.data.length) break;
    startingAfter = res.data[res.data.length - 1].id;
  }
  return all;
}

async function productMap(admin: ReturnType<typeof adminClient>): Promise<Record<string, string>> {
  const { data: cfg } = await admin.from("portal_config").select("value").eq("key", "stripe_products").maybeSingle();
  return cfg?.value ? JSON.parse(cfg.value) : {};
}

function validLines(raw: unknown): Line[] | null {
  if (!Array.isArray(raw) || !raw.length || raw.length > 40) return null;
  const lines = raw.map((l) => ({
    key: typeof l?.key === "string" ? l.key : null,
    description: typeof l?.description === "string" ? l.description.trim().slice(0, 200) : "",
    quantity: Math.round(Number(l?.quantity) * 100) / 100,
    unit_amount: Number(l?.unit_amount),
  }));
  const ok = lines.every(
    (l) =>
      l.description && Number.isFinite(l.quantity) && l.quantity > 0 && Number.isFinite(l.unit_amount) && (l.unit_amount >= 0 || !l.key),
  );
  const total = lines.reduce((n, l) => n + l.quantity * l.unit_amount, 0);
  return ok && total >= 0 ? lines : null;
}

const dashboardUrl = (invoice: { id: string; livemode: boolean }) =>
  `https://dashboard.stripe.com/${invoice.livemode ? "" : "test/"}invoices/${invoice.id}`;
