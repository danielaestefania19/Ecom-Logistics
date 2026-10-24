import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export const EASYPOST_API_KEY = Deno.env.get("EASYPOST_API_KEY") ?? "";

const STATUSES = new Set([
  "unknown", "pre_transit", "in_transit", "out_for_delivery", "delivered",
  "available_for_pickup", "return_to_sender", "failure", "cancelled", "error",
]);

export type Tracker = {
  id: string;
  tracking_code: string;
  status: string;
  carrier?: string;
  est_delivery_date?: string | null;
  tracking_details?: Array<{
    status?: string;
    message?: string;
    datetime?: string;
    tracking_location?: { city?: string; state?: string };
  }>;
};

export async function createTracker(trackingCode: string): Promise<Tracker> {
  const res = await fetch("https://api.easypost.com/v2/trackers", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${EASYPOST_API_KEY}:`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tracker: { tracking_code: trackingCode } }),
  });
  if (!res.ok) throw new Error(`EasyPost ${res.status}: ${await res.text()}`);
  return res.json();
}

// Writes a tracker snapshot onto shipments_inbound + tracking_events. Returns the order ids touched.
export async function applyTracker(admin: SupabaseClient, shipmentIds: string[], tracker: Tracker) {
  const status = STATUSES.has(tracker.status) ? tracker.status : "unknown";
  const details = tracker.tracking_details ?? [];
  const last = details[details.length - 1];
  const deliveredDetail = [...details].reverse().find((d) => d.status === "delivered");

  const { data: rows, error } = await admin
    .from("shipments_inbound")
    .update({
      provider: "easypost",
      provider_tracker_id: tracker.id,
      carrier: tracker.carrier ?? null,
      status,
      eta: tracker.est_delivery_date ? tracker.est_delivery_date.slice(0, 10) : null,
      last_event: last?.message ?? null,
      delivered_at: status === "delivered" ? (deliveredDetail?.datetime ?? new Date().toISOString()) : null,
    })
    .in("id", shipmentIds)
    .select("id, order_id");
  if (error) throw new Error(`update shipments: ${error.message}`);

  const events = (rows ?? []).flatMap((row) =>
    details
      .filter((d) => d.datetime)
      .map((d) => ({
        shipment_id: row.id,
        status: d.status ?? null,
        message: d.message ?? null,
        location: [d.tracking_location?.city, d.tracking_location?.state].filter(Boolean).join(", ") || null,
        occurred_at: d.datetime,
      }))
  );
  if (events.length) {
    const { error: evError } = await admin
      .from("tracking_events")
      .upsert(events, { onConflict: "shipment_id,occurred_at,message", ignoreDuplicates: true });
    if (evError) console.error("tracking_events upsert:", evError.message);
  }

  return { status, orderIds: [...new Set((rows ?? []).map((r) => r.order_id as string))] };
}
