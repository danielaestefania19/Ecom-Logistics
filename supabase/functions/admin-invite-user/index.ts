import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { resendPortalInvite, sendPortalInvite } from "../_shared/invite.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // verify_jwt is false for this function, so the JWT is validated here.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: callerError } = await adminClient.auth.getUser(jwt);
    if (callerError || !caller) return json({ error: "Unauthorized" }, 401);

    const { data: callerProfile } = await adminClient
      .from("clients")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (callerProfile?.role !== "admin") return json({ error: "Forbidden: admin only" }, 403);

    const body = await req.json();

    // Lost or expired invitation: a new one-time link to set the password.
    if (body.action === "resend") {
      const { data: client } = await adminClient.from("clients").select("email, full_name, company, language").eq("id", body.client_id).single();
      if (!client?.email) return json({ error: "client not found" }, 404);
      try {
        await resendPortalInvite(adminClient, { email: client.email, fullName: client.full_name, company: client.company, language: client.language });
      } catch (err) {
        return json({ error: (err as Error).message }, 400);
      }
      return json({ success: true });
    }

    // Only accounts with no operational history can go; anyone with orders stays for the record.
    if (body.action === "delete") {
      const id = body.client_id;
      if (!id) return json({ error: "client_id is required" }, 400);
      if (id === caller.id) return json({ error: "You can't delete your own account." }, 400);
      const [orders, fulfillments, movements] = await Promise.all(
        ["orders", "fulfillment_orders", "inventory_movements"].map((table) =>
          adminClient.from(table).select("id", { count: "exact", head: true }).eq("client_id", id),
        ),
      );
      if (orders.count || fulfillments.count || movements.count) {
        return json({ error: `This client has ${orders.count ?? 0} orders and ${fulfillments.count ?? 0} 3PL orders, so it can't be deleted.` }, 409);
      }
      await adminClient.from("leads").update({ converted_client_id: null }).eq("converted_client_id", id);
      await adminClient.from("sku_barcodes").delete().eq("client_id", id);
      await adminClient.from("products").delete().eq("client_id", id);
      const { error: rowErr } = await adminClient.from("clients").delete().eq("id", id);
      if (rowErr) return json({ error: rowErr.message }, 500);
      const { error: authErr } = await adminClient.auth.admin.deleteUser(id);
      if (authErr) return json({ error: authErr.message }, 500);
      return json({ success: true });
    }

    const { email, full_name, company, asana_project_id, stripe_customer_id } = body;
    const language = body.language === "es" ? "es" : "en";
    if (!email) return json({ error: "email is required" }, 400);

    let newUserId: string;
    try {
      newUserId = (await sendPortalInvite(adminClient, { email, fullName: full_name, company, language })).userId;
    } catch (err) {
      return json({ error: (err as Error).message }, 400);
    }

    const { error: insertError } = await adminClient.from("clients").upsert({
      id: newUserId,
      email,
      language,
      full_name: full_name ?? null,
      company: company ?? null,
      asana_project_id: asana_project_id ?? null,
      stripe_customer_id: stripe_customer_id ?? null,
    }, { onConflict: "id" });

    if (insertError) return json({ error: insertError.message }, 500);

    return json({ success: true, user_id: newUserId, email });
  } catch (err: any) {
    console.error("admin-invite-user error:", err.message);
    return json({ error: err.message ?? "Unknown error" }, 500);
  }
});
