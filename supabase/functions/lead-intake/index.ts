import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, corsHeaders, json } from "../_shared/http.ts";

// Public endpoint behind the website contact form (verify_jwt = false).
const SERVICES: Record<string, string> = { "FBA Prep": "prep", "3PL": "3pl", "LTL": "ltl" };
const LANGUAGES: Record<string, string> = { English: "en", Spanish: "es" };
const CHANNELS = new Set(["amazon", "shopify", "tiktok", "walmart", "other"]);
const CONTACT = new Set(["email", "phone", "whatsapp"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (v: unknown, max = 200) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : null;
};
const int = (v: unknown) => {
  const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n < 100_000_000 ? n : null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const f = await req.json();

    // Honeypot: real visitors never see or fill this field.
    if (text(f.faxNumber)) return json({ ok: true });

    const email = text(f.email, 254)?.toLowerCase() ?? null;
    if (!email || !EMAIL_RE.test(email)) return json({ error: "invalid email" }, 400);
    if (!text(f.firstName) || !text(f.phone)) return json({ error: "missing required fields" }, 400);

    const admin = adminClient();

    // Double submits / refreshes: one lead per email per 10 minutes.
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { count } = await admin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", since);
    if ((count ?? 0) > 0) return json({ ok: true });

    const channels = Array.isArray(f.salesChannels)
      ? f.salesChannels.filter((c: string) => CHANNELS.has(c))
      : [];

    const { error } = await admin.from("leads").insert({
      first_name: text(f.firstName),
      last_name: text(f.lastName),
      company: text(f.companyName),
      website: text(f.companyWebsite, 300),
      email,
      phone: text(f.phone, 40),
      services: SERVICES[f.serviceType] ? [SERVICES[f.serviceType]] : [],
      units_per_month: int(f.unitsPerMonth),
      shipments_per_month: int(f.shipmentsPerMonth),
      message: text(f.message, 4000),
      language: LANGUAGES[f.language] ?? null,
      state: text(f.state),
      city: text(f.city),
      heard_from: text(f.heardFrom),
      sales_channels: channels,
      seller_id_or_store: text(f.sellerIdOrStore, 300),
      product_category: text(f.productCategory),
      hazmat: f.hazmat === true,
      fragile: f.fragile === true,
      job_title: text(f.jobTitle),
      whatsapp: text(f.whatsapp, 40),
      preferred_contact: CONTACT.has(f.preferredContact) ? f.preferredContact : null,
      source: "website",
    });
    if (error) throw new Error(error.message);

    return json({ ok: true });
  } catch (err) {
    console.error("lead-intake error:", (err as Error).message);
    return json({ error: "could not save the request" }, 500);
  }
});
