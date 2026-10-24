import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

export const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
export const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export const adminClient = (): SupabaseClient => createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const bearer = (req: Request) => (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");

export const isServiceCall = (req: Request) => SERVICE_ROLE_KEY !== "" && bearer(req) === SERVICE_ROLE_KEY;

// RLS-scoped check: true only if the calling user may see this order.
export async function userCanAccessOrder(req: Request, orderId: string): Promise<boolean> {
  const token = bearer(req);
  if (!token) return false;
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await userClient.rpc("can_access_order", { p_order: orderId });
  return !error && data === true;
}

// Fire-and-forget from other functions; Asana being down must never block operations.
export async function triggerAsanaSync(orderId: string) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/asana-sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
  } catch (err) {
    console.error("asana-sync trigger failed:", (err as Error).message);
  }
}
