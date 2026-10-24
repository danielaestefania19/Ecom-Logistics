import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ASANA_PAT = Deno.env.get("ASANA_PAT") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function asanaGet(path: string) {
  const res = await fetch(`https://app.asana.com/api/1.0${path}`, {
    headers: {
      Authorization: `Bearer ${ASANA_PAT}`,
      "Accept": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asana ${path}: ${res.status} ${text}`);
  }
  return res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // verify_jwt is false for this function, so the JWT is validated here.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: " + (userError?.message ?? "invalid token") }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userEmail = user.email;
    if (!userEmail) throw new Error("User has no email");

    if (!ASANA_PAT) throw new Error("ASANA_PAT not configured");

    let workspaceGid: string | null = null;
    let emailFieldGid: string | null = null;

    const { data: wsRow } = await supabase.from("portal_config").select("value").eq("key", "asana_workspace_gid").single();
    const { data: efRow } = await supabase.from("portal_config").select("value").eq("key", "asana_email_field_gid").single();

    workspaceGid = wsRow?.value ?? null;
    emailFieldGid = efRow?.value ?? null;

    if (!workspaceGid) {
      const meData = await asanaGet("/users/me?opt_fields=workspaces");
      workspaceGid = meData.data?.workspaces?.[0]?.gid ?? null;
      if (!workspaceGid) throw new Error("No Asana workspace found");
      await supabase.from("portal_config").upsert({ key: "asana_workspace_gid", value: workspaceGid });
    }

    if (!emailFieldGid) {
      const cfData = await asanaGet(`/workspaces/${workspaceGid}/custom_fields?opt_fields=name,gid&limit=100`);
      const emailField = (cfData.data ?? []).find((f: any) =>
        f.name?.toLowerCase().includes("email")
      );
      if (emailField) {
        emailFieldGid = emailField.gid;
        await supabase.from("portal_config").upsert({ key: "asana_email_field_gid", value: emailFieldGid });
      }
    }

    if (!emailFieldGid) throw new Error("Could not find Email custom field in Asana workspace");

    const searchParams = new URLSearchParams({
      [`custom_fields.${emailFieldGid}.value`]: userEmail,
      "opt_fields": "name,completed,modified_at,created_at,memberships.project.name,memberships.section.name,custom_fields.name,custom_fields.display_value",
      "limit": "50",
    });

    const tasksData = await asanaGet(`/workspaces/${workspaceGid}/tasks/search?${searchParams.toString()}`);
    const tasks = tasksData.data ?? [];

    const orders = tasks.map((task: any) => {
      const fields: Record<string, string> = {};
      for (const cf of (task.custom_fields ?? [])) {
        if (cf.name && cf.display_value) {
          fields[cf.name] = cf.display_value;
        }
      }

      const membership = task.memberships?.[0];
      return {
        id: task.gid,
        name: task.name,
        completed: task.completed,
        modifiedAt: task.modified_at,
        createdAt: task.created_at,
        currentProject: membership?.project?.name ?? null,
        currentSection: membership?.section?.name ?? null,
        fields,
      };
    });

    return new Response(
      JSON.stringify({ orders }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("asana-orders error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message ?? "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
