// Bluetooth/USB scanners in keyboard (HID) mode "type" the code and press Enter.
export const normalizeCode = (raw) => (raw ?? "").trim().toUpperCase().replace(/\s+/g, "");

const RECEIVE_STAGES = new Set(["awaiting_inventory", "received", "discrepancy"]);
const PREP_STAGES = new Set(["scheduled", "prepped"]);

// Which scanning workflow an order is in right now, if any.
export const scanModeFor = (order) => {
  if (RECEIVE_STAGES.has(order.stage)) return "receive";
  if (order.type === "prep" && PREP_STAGES.has(order.stage)) return "prep";
  return null;
};

const same = (a, b) => !!a && !!b && a.toUpperCase() === b.toUpperCase();

// Receiving: a line is identified by its FNSKU, its SKU, or a UPC learned for that client SKU.
export function matchReceiving(code, items, aliases = []) {
  const alias = aliases.find((a) => a.code === code);
  return (
    items.find((i) => same(i.fnsku, code)) ??
    (alias && items.find((i) => same(i.sku, alias.sku))) ??
    items.find((i) => same(i.sku, code)) ??
    null
  );
}

// Prep check before shipping to Amazon: only the FNSKU label counts. Scanning the product's own
// UPC/SKU means the unit (or bundle) still lacks its FNSKU label.
export function matchFnsku(code, items, aliases = []) {
  const item = items.find((i) => same(i.fnsku, code));
  if (item) return { item };
  const alias = aliases.find((a) => a.code === code);
  const product = (alias && items.find((i) => same(i.sku, alias.sku))) ?? items.find((i) => same(i.sku, code));
  return product ? { error: "notFnsku", item: product } : { error: "unknown" };
}

// 3PL picking: lines carry their product (sku + optional barcode).
export function matchPick(code, lines, aliases = []) {
  const alias = aliases.find((a) => a.code === code);
  return (
    lines.find((l) => same(l.products?.barcode, code)) ??
    lines.find((l) => same(l.products?.sku, code)) ??
    (alias && lines.find((l) => same(l.products?.sku, alias.sku))) ??
    null
  );
}
