import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { adminClient, corsHeaders, isServiceCall, json } from "../_shared/http.ts";
import { getCaller } from "../_shared/auth.ts";
import { SpApiError, spapiFetch } from "../_shared/spapi.ts";

interface OrdersResponse {
  payload?: {
    Orders?: AmazonOrder[];
    NextToken?: string;
  };
}

interface AmazonOrder {
  AmazonOrderId: string;
  OrderStatus: string;
  PurchaseDate: string;
  LastUpdateDate: string;
  FulfillmentChannel?: string;
  OrderTotal?: { Amount: string; CurrencyCode: string };
  ShippingAddress?: { City?: string; StateOrRegion?: string };
  NumberOfItemsShipped?: number;
  NumberOfItemsUnshipped?: number;
}

interface InventoryResponse {
  payload?: {
    inventorySummaries?: InventorySummary[];
    pagination?: { nextToken?: string };
  };
}

interface InventorySummary {
  sellerSku: string;
  fnSku?: string;
  asin?: string;
  productName?: string;
  condition?: string;
  inventoryDetails?: {
    fulfillableQuantity?: number;
    inboundWorkingQuantity?: number;
    inboundShippedQuantity?: number;
    inboundReceivingQuantity?: number;
    reservedQuantity?: { totalReservedQuantity?: number };
  };
  totalQuantity?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Accept service-role key (cron) or authenticated user (manual trigger)
    const isService = isServiceCall(req);
    if (!isService) {
      const caller = await getCaller(req);
      if (!caller) return json({ error: "Unauthorized" }, 401);
    }

    const { connectionId } = await req.json();
    if (!connectionId) return json({ error: "connectionId required" }, 400);

    const admin = adminClient();

    const { data: conn, error: connErr } = await admin
      .from("amazon_connections")
      .select("id, client_id, selling_partner_id, marketplace_ids, status, last_sync_at")
      .eq("id", connectionId)
      .single();

    if (connErr || !conn) return json({ error: "Connection not found" }, 404);
    if (conn.status !== "active") return json({ error: "Connection is not active" }, 400);

    const marketplaceId = conn.marketplace_ids?.[0] ?? "ATVPDKIKX0DER";
    const lastSync = conn.last_sync_at
      ? new Date(conn.last_sync_at)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const lastUpdatedAfter = lastSync.toISOString();

    // --- Orders sync ---
    let syncedOrders = 0;
    let nextToken: string | undefined;

    do {
      const query: Record<string, string> = {
        MarketplaceIds: marketplaceId,
        LastUpdatedAfter: lastUpdatedAfter,
        FulfillmentChannels: "MFN,AFN",
      };
      if (nextToken) query.NextToken = nextToken;

      const res = await spapiFetch<OrdersResponse>(connectionId, "/orders/v0/orders", { query });
      const orders = res.payload?.Orders ?? [];
      nextToken = res.payload?.NextToken;

      if (orders.length > 0) {
        const rows = orders.map((o) => ({
          connection_id: connectionId,
          client_id: conn.client_id,
          amazon_order_id: o.AmazonOrderId,
          status: o.OrderStatus,
          purchase_date: o.PurchaseDate,
          last_updated: o.LastUpdateDate,
          is_fba: o.FulfillmentChannel === "AFN",
          order_total: o.OrderTotal ? parseFloat(o.OrderTotal.Amount) : null,
          currency: o.OrderTotal?.CurrencyCode ?? null,
          items_count: (o.NumberOfItemsShipped ?? 0) + (o.NumberOfItemsUnshipped ?? 0),
          ship_city: o.ShippingAddress?.City ?? null,
          ship_state: o.ShippingAddress?.StateOrRegion ?? null,
          raw_json: o,
          synced_at: new Date().toISOString(),
        }));

        await admin
          .from("amazon_orders")
          .upsert(rows, { onConflict: "connection_id,amazon_order_id" });

        syncedOrders += rows.length;
      }
    } while (nextToken);

    await sleep(200);

    // --- FBA Inventory sync ---
    let syncedInventory = 0;
    let invNextToken: string | undefined;

    do {
      const query: Record<string, string> = {
        details: "true",
        granularityType: "Marketplace",
        granularityId: marketplaceId,
        marketplaceIds: marketplaceId,
      };
      if (invNextToken) query.nextToken = invNextToken;

      const res = await spapiFetch<InventoryResponse>(
        connectionId,
        "/fba/inventory/v1/summaries",
        { query }
      );
      const summaries = res.payload?.inventorySummaries ?? [];
      invNextToken = res.payload?.pagination?.nextToken;

      if (summaries.length > 0) {
        const rows = summaries.map((s) => ({
          connection_id: connectionId,
          client_id: conn.client_id,
          sku: s.sellerSku,
          fnsku: s.fnSku ?? null,
          asin: s.asin ?? null,
          product_name: s.productName ?? null,
          condition: s.condition ?? null,
          total_quantity: s.totalQuantity ?? 0,
          inbound_working: s.inventoryDetails?.inboundWorkingQuantity ?? 0,
          inbound_shipped: s.inventoryDetails?.inboundShippedQuantity ?? 0,
          inbound_receiving: s.inventoryDetails?.inboundReceivingQuantity ?? 0,
          reserved_quantity: s.inventoryDetails?.reservedQuantity?.totalReservedQuantity ?? 0,
          synced_at: new Date().toISOString(),
        }));

        await admin
          .from("amazon_fba_inventory")
          .upsert(rows, { onConflict: "connection_id,sku" });

        syncedInventory += rows.length;
      }
    } while (invNextToken);

    // Mark connection synced
    await admin
      .from("amazon_connections")
      .update({ last_sync_at: new Date().toISOString(), last_error: null })
      .eq("id", connectionId);

    return json({ synced_orders: syncedOrders, synced_inventory: syncedInventory });
  } catch (err) {
    if (err instanceof SpApiError) return json({ error: err.message }, err.status);
    console.error("amazon-sync error:", (err as Error).message);
    return json({ error: "Internal error" }, 500);
  }
});
