import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, json, triggerAsanaSync } from "../_shared/http.ts";
import { applyTracker, type Tracker } from "../_shared/easypost.ts";

const WEBHOOK_SECRET = Deno.env.get("EASYPOST_WEBHOOK_SECRET") ?? "";

// EasyPost signs the raw body: X-Hmac-Signature: hmac-sha256-hex=<hex(HMAC_SHA256(NFKD(secret), body))>
async function validSignature(rawBody: string, header: string | null) {
  if (!header?.startsWith("hmac-sha256-hex=")) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(WEBHOOK_SECRET.normalize("NFKD")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
  const expected = Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
  const given = header.slice("hmac-sha256-hex=".length).toLowerCase();
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  // Without a secret anyone could forge deliveries, so refuse rather than accept unsigned events.
  if (!WEBHOOK_SECRET) return json({ error: "EASYPOST_WEBHOOK_SECRET not configured" }, 503);

  const raw = await req.text();
  if (!(await validSignature(raw, req.headers.get("X-Hmac-Signature")))) {
    return json({ error: "Invalid signature" }, 401);
  }

  try {
    const event = JSON.parse(raw);
    if (!String(event?.description ?? "").startsWith("tracker.")) return json({ ignored: true });
    const tracker = event.result as Tracker;
    if (!tracker?.id) return json({ ignored: true });

    const admin = adminClient();
    let { data: shipments } = await admin.from("shipments_inbound").select("id").eq("provider_tracker_id", tracker.id);
    if (!shipments?.length && tracker.tracking_code) {
      ({ data: shipments } = await admin
        .from("shipments_inbound")
        .select("id")
        .eq("tracking_number", tracker.tracking_code.toUpperCase())
        .is("provider_tracker_id", null));
    }
    if (!shipments?.length) return json({ ignored: "unknown tracker" });

    const { status, orderIds } = await applyTracker(admin, shipments.map((s) => s.id), tracker);

    if (status === "delivered") {
      for (const orderId of orderIds) {
        const { data: moved } = await admin.rpc("mark_order_delivered", { p_order: orderId });
        if (moved) await triggerAsanaSync(orderId);
      }
    }
    return json({ ok: true });
  } catch (err) {
    console.error("tracking-webhook error:", (err as Error).message);
    // 200 so EasyPost doesn't retry forever on a payload we can't process.
    return json({ error: (err as Error).message });
  }
});
