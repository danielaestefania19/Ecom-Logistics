import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, corsHeaders, json } from "../_shared/http.ts";
import { canActForClient, getCaller } from "../_shared/auth.ts";

const STATE_TTL_MS = 24 * 60 * 60 * 1000;
const SELLER_CENTRAL_URL = Deno.env.get("SELLER_CENTRAL_URL") ?? "https://sellercentral.amazon.com";

// Returns the Seller Central consent URL. Staff may generate it for a client and send it to them.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const caller = await getCaller(req);
    if (!caller) return json({ error: "Unauthorized" }, 401);

    const applicationId = Deno.env.get("SPAPI_APPLICATION_ID");
    if (!applicationId) return json({ error: "Amazon integration is not configured" }, 503);

    const body = await req.json().catch(() => ({}));
    const clientId: string = body.client_id ?? caller.id;
    if (!canActForClient(caller, clientId)) return json({ error: "Forbidden" }, 403);

    const admin = adminClient();
    const { data: client } = await admin.from("clients").select("id").eq("id", clientId).maybeSingle();
    if (!client) return json({ error: "Client not found" }, 404);

    const nonce = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
    const expiresAt = new Date(Date.now() + STATE_TTL_MS).toISOString();
    const { error } = await admin.from("amazon_oauth_states").insert({
      nonce,
      client_id: clientId,
      created_by: caller.id,
      expires_at: expiresAt,
    });
    if (error) throw new Error(error.message);

    const url = new URL("/apps/authorize/consent", SELLER_CENTRAL_URL);
    url.searchParams.set("application_id", applicationId);
    url.searchParams.set("state", nonce);
    // Draft apps can only be authorized with version=beta (up to 25 sellers).
    if (Deno.env.get("SPAPI_APP_PUBLISHED") !== "true") url.searchParams.set("version", "beta");

    return json({ url: url.toString(), expires_at: expiresAt });
  } catch (err) {
    console.error("amazon-oauth-start error:", (err as Error).message);
    return json({ error: "Could not start the Amazon connection" }, 500);
  }
});
