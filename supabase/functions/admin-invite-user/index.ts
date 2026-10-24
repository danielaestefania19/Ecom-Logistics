import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const PORTAL_SET_PASSWORD_URL = "https://ecomlogisticsus.com/portal/set-password";

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
    const { email, full_name, company, asana_project_id, stripe_customer_id } = body;
    if (!email) return json({ error: "email is required" }, 400);

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: PORTAL_SET_PASSWORD_URL,
      data: { full_name, company },
    });
    if (inviteError) return json({ error: inviteError.message }, 400);

    const newUserId = inviteData.user.id;

    const { error: insertError } = await adminClient.from("clients").upsert({
      id: newUserId,
      email,
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
