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

// ── Phase 2: Sync ──────────────────────────────────────────────────────────────

export const syncConnection = (connectionId) =>
  callFunction("amazon-sync", { connectionId });

export async function listAmazonOrders(connectionId) {
  let q = supabase
    .from("amazon_orders")
    .select("id, amazon_order_id, status, purchase_date, last_updated, is_fba, order_total, currency, items_count, ship_city, ship_state, connection_id")
    .order("purchase_date", { ascending: false })
    .limit(200);
  if (connectionId) q = q.eq("connection_id", connectionId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function listFbaInventory(connectionId) {
  let q = supabase
    .from("amazon_fba_inventory")
    .select("id, sku, fnsku, asin, product_name, condition, total_quantity, inbound_working, inbound_shipped, inbound_receiving, reserved_quantity, synced_at, connection_id")
    .order("sku");
  if (connectionId) q = q.eq("connection_id", connectionId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ── Phase 3: FBA Inbound Plans ────────────────────────────────────────────────

export const createInboundPlan = (connectionId, orderId, payload = {}) =>
  callFunction("amazon-inbound", { step: "create", connectionId, orderId, payload });

export const advanceInboundPlan = (planId, step, connectionId, payload = {}) =>
  callFunction("amazon-inbound", { step, planId, connectionId, payload });

export const pollInboundPlan = (planId, connectionId) =>
  callFunction("amazon-inbound", { step: "poll", planId, connectionId });

export async function listInboundPlans(orderId) {
  let q = supabase
    .from("amazon_inbound_plans")
    .select("id, client_id, connection_id, order_id, inbound_plan_id, current_step, status, error, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (orderId) q = q.eq("order_id", orderId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getInboundPlan(planId) {
  const { data, error } = await supabase
    .from("amazon_inbound_plans")
    .select("*")
    .eq("id", planId)
    .single();
  if (error) throw error;
  return data;
}
