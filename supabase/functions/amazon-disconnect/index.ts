import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, corsHeaders, json } from "../_shared/http.ts";
import { canActForClient, getCaller } from "../_shared/auth.ts";

// Drops our copy of the seller's refresh token. The seller can also revoke from Seller Central.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const caller = await getCaller(req);
    if (!caller) return json({ error: "Unauthorized" }, 401);

    const { connection_id } = await req.json().catch(() => ({}));
    if (!connection_id) return json({ error: "connection_id is required" }, 400);

    const admin = adminClient();
    const { data: connection } = await admin
      .from("amazon_connections")
      .select("id, client_id")
      .eq("id", connection_id)
      .maybeSingle();
    if (!connection) return json({ error: "Connection not found" }, 404);
    if (!canActForClient(caller, connection.client_id)) return json({ error: "Forbidden" }, 403);

    const { error: delError } = await admin.rpc("amazon_delete_refresh_token", { p_connection: connection.id });
    if (delError) throw new Error(delError.message);
    const { error } = await admin
      .from("amazon_connections")
      .update({ status: "revoked", last_error: null })
      .eq("id", connection.id);
    if (error) throw new Error(error.message);

    return json({ success: true });
  } catch (err) {
    console.error("amazon-disconnect error:", (err as Error).message);
    return json({ error: "Could not disconnect" }, 500);
  }
});
