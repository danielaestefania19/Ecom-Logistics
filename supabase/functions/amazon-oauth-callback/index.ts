import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient } from "../_shared/http.ts";
import { exchangeAuthCode } from "../_shared/spapi.ts";

const PORTAL_URL = "https://ecomlogisticsus.com/portal/amazon";

const redirect = (query: string) =>
  new Response(null, { status: 302, headers: { Location: `${PORTAL_URL}?${query}` } });

// Amazon redirects the seller's browser here with spapi_oauth_code, state and selling_partner_id.
// verify_jwt is false: the one-shot `state` nonce is the authentication.
Deno.serve(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  const code = params.get("spapi_oauth_code");
  const state = params.get("state");
  const sellingPartnerId = params.get("selling_partner_id");
  if (!code || !state || !sellingPartnerId) return redirect("error=missing_params");

  const admin = adminClient();
  try {
    const { data: clientId } = await admin.rpc("amazon_consume_oauth_state", { p_nonce: state });
    if (!clientId) return redirect("error=invalid_state");

    const tokens = await exchangeAuthCode(code);
    if (!tokens.refresh_token) return redirect("error=no_refresh_token");

    const { data: connection, error } = await admin
      .from("amazon_connections")
      .upsert(
        { client_id: clientId, selling_partner_id: sellingPartnerId, status: "active", last_error: null, connected_at: new Date().toISOString() },
        { onConflict: "client_id,selling_partner_id" },
      )
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const { error: storeError } = await admin.rpc("amazon_store_refresh_token", {
      p_connection: connection.id,
      p_token: tokens.refresh_token,
    });
    if (storeError) throw new Error(storeError.message);

    return redirect("connected=1");
  } catch (err) {
    console.error("amazon-oauth-callback error:", (err as Error).message);
    return redirect("error=exchange_failed");
  }
});
