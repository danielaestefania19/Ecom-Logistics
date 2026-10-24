import { supabase } from "../../lib/supabaseClient";

export const STAGES = [
  "quote",
  "awaiting_inventory",
  "received",
  "discrepancy",
  "scheduled",
  "prepped",
  "in_storage",
  "shipped",
  "invoiced",
  "paid",
  "cancelled",
];

export const BOARD_STAGES = STAGES.filter((s) => s !== "paid" && s !== "cancelled");

// Happy-path steps shown to clients as a progress bar.
export const CLIENT_STEPS = ["awaiting_inventory", "received", "scheduled", "prepped", "shipped", "paid"];

export const NEXT_STAGES = {
  quote: ["awaiting_inventory", "cancelled"],
  awaiting_inventory: ["received", "quote", "cancelled"],
  received: ["scheduled", "discrepancy"],
  discrepancy: ["scheduled", "received", "cancelled"],
  scheduled: ["prepped"],
  prepped: ["shipped", "in_storage"],
  in_storage: ["shipped"],
  shipped: ["invoiced"],
  invoiced: ["paid"],
  paid: [],
  cancelled: ["awaiting_inventory"],
};

export const STAGE_STYLE = {
  quote: "bg-purple-50 text-purple-700 border border-purple-200",
  awaiting_inventory: "bg-gray-100 text-gray-700 border border-gray-200",
  received: "bg-blue-50 text-blue-700 border border-blue-200",
  discrepancy: "bg-red-50 text-red-700 border border-red-200",
  scheduled: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  prepped: "bg-teal-50 text-teal-700 border border-teal-200",
  in_storage: "bg-amber-50 text-amber-800 border border-amber-200",
  shipped: "bg-green-50 text-green-700 border border-green-200",
  invoiced: "bg-sky-50 text-sky-700 border border-sky-200",
  paid: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  cancelled: "bg-gray-100 text-gray-400 border border-gray-200 line-through",
};

export const TRACKING_STYLE = {
  delivered: "bg-green-50 text-green-700",
  out_for_delivery: "bg-blue-50 text-blue-700",
  in_transit: "bg-sky-50 text-sky-700",
  pre_transit: "bg-gray-100 text-gray-600",
  available_for_pickup: "bg-amber-50 text-amber-800",
  return_to_sender: "bg-red-50 text-red-700",
  failure: "bg-red-50 text-red-700",
  error: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-400",
  unknown: "bg-gray-100 text-gray-500",
};

export const orderUnits = (order) =>
  (order.order_items ?? []).reduce((n, i) => n + (i.expected_qty || 0), 0);

export const orderCode = (order) => `#${order.order_number}`;

export const isoDay = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

// Dates stored as plain `date` must not shift with the viewer's timezone.
export const parseDay = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export async function callFunction(name, body) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

// Mirror + tracking are best-effort: the order is already saved, so never surface their failures as errors.
export const syncAsana = (orderId) =>
  callFunction("asana-sync", { order_id: orderId }).catch((e) => console.warn("asana-sync:", e.message));

export const registerTracking = (orderId) =>
  callFunction("tracking-register", { order_id: orderId }).catch((e) => console.warn("tracking-register:", e.message));

export async function setStage(orderId, stage, note) {
  const { error } = await supabase.rpc("set_order_stage", { p_order: orderId, p_stage: stage, p_note: note || null });
  if (error) throw error;
  syncAsana(orderId);
}

export async function uploadOrderFile(orderId, file, kind) {
  const safe = file.name.replace(/[^\w.-]+/g, "_").slice(-80);
  const path = `${orderId}/${Date.now()}-${safe}`;
  const { error: upErr } = await supabase.storage.from("order-files").upload(path, file, { contentType: file.type });
  if (upErr) throw upErr;
  const { error } = await supabase.from("order_files").insert({ order_id: orderId, kind, storage_path: path, file_name: file.name });
  if (error) {
    await supabase.storage.from("order-files").remove([path]);
    throw error;
  }
}

export async function openOrderFile(path) {
  const { data, error } = await supabase.storage.from("order-files").createSignedUrl(path, 600);
  if (error) throw error;
  window.open(data.signedUrl, "_blank", "noopener");
}

// Refetch whenever any of the given tables change; RLS limits what each viewer receives.
export function subscribeToChanges(channelName, tables, onChange) {
  const channel = supabase.channel(channelName);
  for (const { table, filter } of tables) {
    channel.on("postgres_changes", { event: "*", schema: "public", table, ...(filter ? { filter } : {}) }, onChange);
  }
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}
