// RFC 4180-ish parser: quoted fields, escaped quotes, commas/newlines inside quotes, CRLF.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }

  const nonEmpty = rows.filter((r) => r.some((v) => v.trim() !== ""));
  if (!nonEmpty.length) return [];
  const header = nonEmpty[0].map((h) => h.trim().toLowerCase());
  return nonEmpty.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

// Column aliases for Shopify and TikTok Shop order exports, most specific first.
const COLUMNS = {
  ref: ["name", "order id", "order number", "order", "order_ref"],
  recipient: ["shipping name", "recipient", "recipient_name", "buyer name"],
  sku: ["lineitem sku", "seller sku", "sku"],
  qty: ["lineitem quantity", "quantity", "qty"],
  address1: ["shipping address1", "shipping street", "address line 1", "address"],
  address2: ["shipping address2", "address line 2"],
  city: ["shipping city", "city"],
  state: ["shipping province", "state", "province"],
  zip: ["shipping zip", "zipcode", "zip", "postal code"],
  country: ["shipping country", "country"],
};

const pick = (row, key) => {
  for (const alias of COLUMNS[key]) if (row[alias]) return row[alias];
  return "";
};

// Groups line-item rows into orders. Shopify repeats the order on each line but only fills
// shipping fields on the first row, so the first non-empty value wins.
export function groupOrders(rows) {
  const byRef = new Map();
  for (const row of rows) {
    const ref = pick(row, "ref");
    const sku = pick(row, "sku");
    const qty = parseInt(pick(row, "qty"), 10);
    if (!ref) continue;
    if (!byRef.has(ref)) byRef.set(ref, { external_ref: ref, recipient_name: "", ship_to: "", lines: [] });
    const order = byRef.get(ref);
    if (!order.recipient_name) order.recipient_name = pick(row, "recipient");
    if (!order.ship_to) {
      const cityLine = [pick(row, "city"), [pick(row, "state"), pick(row, "zip")].filter(Boolean).join(" ")].filter(Boolean).join(", ");
      order.ship_to = [pick(row, "address1"), pick(row, "address2"), cityLine, pick(row, "country")].filter(Boolean).join("\n");
    }
    if (sku && qty > 0) {
      const existing = order.lines.find((l) => l.sku === sku);
      if (existing) existing.qty += qty;
      else order.lines.push({ sku, qty });
    }
  }
  return [...byRef.values()];
}
