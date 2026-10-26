import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminClient, corsHeaders, json, SUPABASE_URL } from "../_shared/http.ts";
import { ensureStripeCustomer } from "../_shared/stripe.ts";

const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const PORTAL_SET_PASSWORD_URL = "https://ecomlogisticsus.com/portal/set-password";
const SERVICES = new Set(["prep", "3pl"]);

// Won lead → client account (+ portal invitation). Staff only.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user } } = await userClient.auth.getUser(token);
    const { data: staff } = await userClient.rpc("is_staff");
    if (!user || staff !== true) return json({ error: "Forbidden" }, 403);

    const { lead_id, services, language } = await req.json();
    const svc = (Array.isArray(services) ? services : []).filter((s: string) => SERVICES.has(s));
    if (!lead_id || !svc.length) return json({ error: "lead and at least one service are required" }, 400);

    const admin = adminClient();
    const { data: lead, error: leadErr } = await admin.from("leads").select("*").eq("id", lead_id).single();
    if (leadErr || !lead) return json({ error: "lead not found" }, 404);
    if (lead.converted_client_id) return json({ error: "lead already converted", client_id: lead.converted_client_id }, 409);
    if (!lead.email) return json({ error: "the lead needs an email to receive the portal invitation" }, 400);

    const profile = {
      email: lead.email,
      full_name: [lead.first_name, lead.last_name].filter(Boolean).join(" ") || null,
      company: lead.company,
      phone: lead.phone,
      language: language === "es" || language === "en" ? language : lead.language ?? "en",
      services: svc,
      website: lead.website,
      sales_channels: lead.sales_channels ?? [],
      seller_id_or_store: lead.seller_id_or_store,
      product_category: lead.product_category,
      job_title: lead.job_title,
      whatsapp: lead.whatsapp,
      preferred_contact: lead.preferred_contact,
      address_city: lead.city,
      address_state: lead.state,
    };

    // Someone with this email may already have a portal account: link it instead of inviting again.
    // ilike for case-insensitivity; escape its wildcards so "a_b@x.com" can't match "axb@x.com".
    const emailPattern = lead.email.replace(/[\\%_]/g, (c: string) => `\\${c}`);
    const { data: existing } = await admin.from("clients").select("id").ilike("email", emailPattern).maybeSingle();
    let clientId: string;
    let invited = false;

    if (existing) {
      clientId = existing.id;
      const { error } = await admin.from("clients").update({ services: svc }).eq("id", clientId);
      if (error) throw new Error(error.message);
    } else {
      const { data: inv, error: invErr } = await admin.auth.admin.inviteUserByEmail(lead.email, {
        redirectTo: PORTAL_SET_PASSWORD_URL,
        data: { full_name: profile.full_name, company: lead.company },
      });
      if (invErr) return json({ error: invErr.message }, 400);
      clientId = inv.user.id;
      invited = true;
      const { error } = await admin.from("clients").upsert({ id: clientId, ...profile }, { onConflict: "id" });
      if (error) throw new Error(error.message);
    }

    // Best effort: a Stripe hiccup must not undo the conversion; staff can link it later from Admin.
    let stripeCustomerId: string | null = null;
    try {
      stripeCustomerId = (await ensureStripeCustomer(admin, clientId)).id;
    } catch (err) {
      console.error("convert-lead stripe:", (err as Error).message);
    }

    await admin.from("leads").update({ status: "won", converted_client_id: clientId }).eq("id", lead_id);
    await admin.from("lead_activities").insert({
      lead_id,
      kind: "system",
      body: invited ? "converted_invited" : "converted_linked",
      actor_id: user.id,
    });

    return json({ ok: true, client_id: clientId, invited, stripe_customer_id: stripeCustomerId });
  } catch (err) {
    console.error("convert-lead error:", (err as Error).message);
    return json({ error: (err as Error).message }, 500);
  }
});
