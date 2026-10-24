import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function stripeGet(path: string) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe ${path}: ${res.status} ${err}`);
  }
  return res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) throw new Error("Unauthorized: " + (userError?.message ?? "no user"));

    const userEmail = user.email;
    if (!userEmail) throw new Error("User has no email");

    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");

    let stripeCustomerId: string | null = null;
    const { data: clientRow } = await supabase
      .from("clients")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (clientRow?.stripe_customer_id) {
      stripeCustomerId = clientRow.stripe_customer_id;
    } else {
      const search = await stripeGet(
        `/customers/search?query=email:"${encodeURIComponent(userEmail)}"&limit=1`
      );
      if (search.data && search.data.length > 0) {
        stripeCustomerId = search.data[0].id;
        await supabase
          .from("clients")
          .upsert({ id: user.id, stripe_customer_id: stripeCustomerId }, { onConflict: "id" });
      }
    }

    if (!stripeCustomerId) {
      return new Response(JSON.stringify({ invoices: [], customer: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const invoiceData = await stripeGet(
      `/invoices?customer=${stripeCustomerId}&limit=25`
    );

    const invoices = (invoiceData.data ?? []).map((inv: any) => ({
      id: inv.id,
      number: inv.number,
      description: inv.description ||
        (inv.lines?.data?.[0]?.description) ||
        "Invoice",
      amountDue: inv.amount_due,
      amountPaid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      dueDate: inv.due_date,
      pdfUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
    }));

    return new Response(
      JSON.stringify({ invoices, customer: stripeCustomerId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("stripe-invoices error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message ?? "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
