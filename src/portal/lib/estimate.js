import { pricingSections, VOLUME_TIERS } from "../../landing/pricing/pricingData";

const RATE = Object.fromEntries(
  pricingSections.flatMap((s) => s.rows.filter((r) => r.id).map((r) => [r.id, r.price]))
);

export const PREP_TYPES = ["standard", "oversize", "polybag", "bubble", "bundle"];
export const EXTRAS = ["pallet", "pallet_wrap", "coupon_insert", "filler"];
export const PACKAGING = ["small_medium_box", "large_box", "bubble_mailer", "poly_mailer"];

// Same flooring as the public /pricing page, so the portal never quotes less discount than advertised.
const floorCents = (n) => Math.floor(n * 100) / 100;
const roundCents = (n) => Math.round(n * 100) / 100;

export function volumeDiscount(units) {
  const [, mid, high] = VOLUME_TIERS.en;
  if (units >= 1500) return high.discount;
  if (units >= 501) return mid.discount;
  return 0;
}

// Informational estimate only; invoices are still created by hand in Stripe.
export function estimateOrder({ items, totalCases = 0, pallets = 0, extras = [] }) {
  const qtyOf = (i) => Math.max(0, Number(i.expected_qty) || 0);
  const units = items.reduce((n, i) => n + qtyOf(i), 0);
  const discount = volumeDiscount(units);
  const palletCount = Math.max(Number(pallets) || 0, 1);
  const lines = [];

  for (const type of PREP_TYPES) {
    const qty = items.filter((i) => (i.prep_type || "standard") === type).reduce((n, i) => n + qtyOf(i), 0);
    if (qty) lines.push({ key: `prep_${type}`, qty, rate: floorCents(RATE[`prep_${type}`] * (1 - discount)) });
  }
  if (totalCases > 0) lines.push({ key: "case_receiving", qty: Number(totalCases), rate: RATE.case_receiving });
  if (pallets > 0) lines.push({ key: "pallet_receiving", qty: Number(pallets), rate: RATE.pallet_receiving });
  if (extras.includes("pallet")) lines.push({ key: "pallet_standard", qty: palletCount, rate: RATE.pallet_standard });
  if (extras.includes("pallet_wrap")) lines.push({ key: "pallet_wrap", qty: palletCount, rate: RATE.pallet_wrap });
  if (extras.includes("coupon_insert") && units) lines.push({ key: "coupon_insert", qty: units, rate: RATE.coupon_insert });
  if (extras.includes("filler") && units) lines.push({ key: "filler", qty: units, rate: RATE.filler });

  const priced = lines.map((l) => ({ ...l, total: roundCents(l.qty * l.rate) }));
  return { units, discount, lines: priced, total: roundCents(priced.reduce((n, l) => n + l.total, 0)) };
}

// The order's estimate as stored in orders.estimated_cost. 3PL inbounds only pay receiving.
export const orderEstimate = (order, items = order.order_items) =>
  estimateOrder({
    items: order.type === "3pl" ? [] : items,
    totalCases: order.total_cases,
    pallets: order.pallets,
    extras: order.extras ?? [],
  });

// Bill the good units counted at receiving, falling back to what the order expected. The FNSKU scan
// count is a verification aid and can be partial, so it never drives the invoice.
const billedQty = (i) => (i.received_qty != null ? Math.max(i.received_qty - (i.damaged_qty ?? 0), 0) : i.expected_qty);

// Starting point for a quote: the price-list estimate (unit amounts in cents).
export const quoteDraftLines = (order, labels) =>
  orderEstimate(order).lines.map((l) => ({
    key: l.key,
    description: labels[l.key] ?? l.key,
    quantity: l.qty,
    unit_amount: Math.round(l.rate * 100),
  }));

// Lines for the Stripe invoice draft (unit amounts in cents). 3PL inbound orders bill receiving
// only: their pick & pack and storage are billed by month. Once the client accepts a quote, its
// prices replace the price list (quantities still come from what was received) and its custom
// lines, discounts included, are added as they are.
export function invoiceLines(order, labels) {
  const lines = orderEstimate(order, order.order_items.map((i) => ({ ...i, expected_qty: billedQty(i) })))
    .lines.map((l) => ({ key: l.key, description: labels[l.key] ?? l.key, quantity: l.qty, unit_amount: Math.round(l.rate * 100) }));
  const quote = order.quote_status === "accepted" ? order.order_quote_lines ?? [] : [];
  if (!quote.length) return lines;
  const quoted = Object.fromEntries(quote.filter((q) => q.key).map((q) => [q.key, Number(q.unit_amount)]));
  return [
    ...lines.map((l) => (l.key in quoted ? { ...l, unit_amount: quoted[l.key] } : l)),
    ...quote
      .filter((q) => !q.key)
      .map((q) => ({ key: null, description: q.description, quantity: Number(q.quantity), unit_amount: Number(q.unit_amount) })),
  ];
}

// 3PL month to date: pick & pack per shipped order (tier set by the month's order count) + storage held.
export function estimateMonth({ shippedPackagings = [], bins = 0, shelves = 0, pallets = 0 }) {
  const orders = shippedPackagings.length;
  const discount = volumeDiscount(orders);
  const lines = [];
  for (const p of PACKAGING) {
    const qty = shippedPackagings.filter((x) => x === p).length;
    if (qty) lines.push({ key: `pick_${p}`, qty, rate: floorCents(RATE[`pick_${p}`] * (1 - discount)) });
  }
  for (const [key, qty] of [["storage_bin", bins], ["storage_shelf", shelves], ["storage_pallet", pallets]]) {
    if (qty > 0) lines.push({ key, qty: Number(qty), rate: RATE[key] });
  }
  const priced = lines.map((l) => ({ ...l, total: roundCents(l.qty * l.rate) }));
  return { orders, discount, lines: priced, total: roundCents(priced.reduce((n, l) => n + l.total, 0)) };
}
