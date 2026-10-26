import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

type Params = Record<string, unknown>;

// Stripe takes form encoding with bracketed keys for nested objects: address[city]=…
function encode(params: Params, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => out.append(`${key}[${i}]`, String(item)));
    else if (typeof v === "object") encode(v as Params, key, out);
    else out.append(key, String(v));
  }
  return out;
}

export async function stripe(method: "GET" | "POST", path: string, params: Params = {}) {
  if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  const query = method === "GET" ? `?${encode(params)}` : "";
  const res = await fetch(`https://api.stripe.com/v1${path}${query}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? encode(params) : undefined,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Stripe ${path}: ${body?.error?.message ?? res.status}`);
  return body;
}

// Links a portal client to a Stripe customer: reuses one with the same email, else creates it.
export async function ensureStripeCustomer(admin: SupabaseClient, clientId: string): Promise<{ id: string; created: boolean }> {
  const { data: c, error } = await admin.from("clients").select("*").eq("id", clientId).single();
  if (error || !c) throw new Error("client not found");
  if (c.stripe_customer_id) return { id: c.stripe_customer_id, created: false };
  if (!c.email) throw new Error("the client has no email");

  const found = await stripe("GET", "/customers", { email: c.email, limit: 1 });
  let id: string = found.data?.[0]?.id;
  let created = false;
  if (!id) {
    const customer = await stripe("POST", "/customers", {
      email: c.email,
      name: c.company || c.full_name,
      phone: c.phone,
      preferred_locales: [c.language === "es" ? "es-419" : "en"],
      address: c.address_line1
        ? {
            line1: c.address_line1,
            line2: c.address_line2,
            city: c.address_city,
            state: c.address_state,
            postal_code: c.address_zip,
            // Stripe wants an ISO code; the profile may hold "United States".
            country: /^[a-z]{2}$/i.test(c.address_country ?? "") ? c.address_country.toUpperCase() : "US",
          }
        : undefined,
      metadata: { portal_client_id: c.id },
    });
    id = customer.id;
    created = true;
  }
  const { error: saveErr } = await admin.from("clients").update({ stripe_customer_id: id }).eq("id", clientId);
  if (saveErr) throw new Error(saveErr.message);
  return { id, created };
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

// Stripe-Signature: "t=<unix>,v1=<hex hmac of `${t}.${payload}`>[,v1=…]".
export async function verifyStripeSignature(payload: string, header: string, secret: string, toleranceSec = 300) {
  const parts = header.split(",").map((p) => p.split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`)));
  return signatures.some((s) => s.length === expected.length && timingSafeEqual(s, expected));
}

function timingSafeEqual(a: string, b: string) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
