import { supabase } from "../../lib/supabaseClient";
import { callFunction } from "./orders";

export async function listConnections() {
  const { data, error } = await supabase
    .from("amazon_connections")
    .select("id, client_id, selling_partner_id, marketplace_ids, status, connected_at, last_sync_at, last_error, clients(company, email)")
    .order("connected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const startAmazonConnect = (clientId) =>
  callFunction("amazon-oauth-start", clientId ? { client_id: clientId } : {});

export const disconnectAmazon = (connectionId) => callFunction("amazon-disconnect", { connection_id: connectionId });
