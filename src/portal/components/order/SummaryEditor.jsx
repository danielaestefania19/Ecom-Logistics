import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { EXTRAS, orderEstimate } from "../../lib/estimate";
import { syncAsana } from "../../lib/orders";
import { btnPrimary, btnSecondary, ErrorBanner, Field, inputCls } from "../ui";

const SHIP_METHODS = ["spd", "ltl"];
const CREATORS = ["customer", "ecom_seller_central", "ecom_scanpower"];
const STORAGE = ["none", "1m", "2m", "3m_plus"];
const SHIPMENTS = ["single", "multiple"];

const pick = (o) => ({
  eta: o.eta ?? "",
  ship_method: o.ship_method ?? "spd",
  shipment_creator: o.shipment_creator ?? "customer",
  inbound_shipments: o.inbound_shipments ?? "single",
  total_cases: String(o.total_cases ?? 0),
  pallets: String(o.pallets ?? 0),
  storage_requested: o.storage_requested ?? "none",
  extras: o.extras ?? [],
  client_notes: o.client_notes ?? "",
  estimated_cost: o.estimated_cost == null ? "" : String(o.estimated_cost),
});

// Admins correct anything the client entered in the order. The database refuses these fields to
// other staff. Each save leaves an internal note listing what changed.
const SummaryEditor = ({ order, onDone }) => {
  const { t } = useT();
  const prep = order.type !== "3pl";
  const [form, setForm] = useState(() => pick(order));
  const [costTouched, setCostTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Cases, pallets and extras change the price-list estimate; follow them unless the admin typed a cost.
  const estimateFor = (f) =>
    orderEstimate({ ...order, total_cases: Number(f.total_cases) || 0, pallets: Number(f.pallets) || 0, extras: f.extras }).total;
  const set = (k, v) =>
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (!costTouched && ["total_cases", "pallets", "extras"].includes(k)) next.estimated_cost = String(estimateFor(next) || "");
      return next;
    });
  const toggleExtra = (x) => set("extras", form.extras.includes(x) ? form.extras.filter((e) => e !== x) : [...form.extras, x]);

  const save = async () => {
    const whole = (v) => /^\d+$/.test(String(v).trim());
    if (!whole(form.total_cases) || !whole(form.pallets)) return setError(t("summaryEdit.badNumber"));
    if (form.estimated_cost !== "" && !(Number(form.estimated_cost) >= 0)) return setError(t("summaryEdit.badNumber"));

    const next = {
      eta: form.eta || null,
      inbound_shipments: form.inbound_shipments,
      total_cases: Number(form.total_cases),
      pallets: Number(form.pallets),
      client_notes: form.client_notes.trim() || null,
      estimated_cost: form.estimated_cost === "" ? null : Number(form.estimated_cost),
      ...(prep && {
        ship_method: form.ship_method,
        shipment_creator: form.shipment_creator,
        storage_requested: form.storage_requested,
        extras: form.extras,
      }),
    };
    const show = (k, v) => {
      if (v == null || v === "") return "—";
      if (k === "ship_method") return t(`shipMethod.${v}`);
      if (k === "shipment_creator") return t(`shipmentCreator.${v}`);
      if (k === "inbound_shipments") return t(`inboundShipments.${v}`);
      if (k === "storage_requested") return t(`storage.${v}`);
      if (k === "extras") return v.length ? v.map((x) => t(`extras.${x}`)).join(", ") : "—";
      return String(v);
    };
    const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
    const patch = Object.fromEntries(
      Object.entries(next).filter(([k, v]) => !same(k === "estimated_cost" && order[k] != null ? Number(order[k]) : order[k], v))
    );
    if (!Object.keys(patch).length) return onDone(false);

    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("orders").update(patch).eq("id", order.id);
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    const LABELS = {
      eta: "order.eta", ship_method: "order.shipMethod", shipment_creator: "order.shipmentCreator",
      inbound_shipments: "order.shipments", total_cases: "order.cases", pallets: "order.pallets",
      storage_requested: "order.storage", extras: "order.extras", client_notes: "order.notes", estimated_cost: "order.estimate",
    };
    const summary = Object.keys(patch)
      .map((k) => `${t(LABELS[k])}: ${show(k, order[k])} → ${show(k, patch[k])}`)
      .join("\n");
    await supabase.from("order_events").insert({ order_id: order.id, note: `${t("summaryEdit.note")}\n${summary}`, visible_to_client: false });
    syncAsana(order.id);
    setBusy(false);
    onDone(true);
  };

  const select = (k, values, prefix) => (
    <select className={inputCls} value={form[k]} onChange={(e) => set(k, e.target.value)}>
      {values.map((v) => <option key={v} value={v}>{t(`${prefix}.${v}`)}</option>)}
    </select>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("order.eta")}>
          <input type="date" className={inputCls} value={form.eta} onChange={(e) => set("eta", e.target.value)} />
        </Field>
        <Field label={t("order.shipments")}>{select("inbound_shipments", SHIPMENTS, "inboundShipments")}</Field>
        <Field label={t("order.cases")}>
          <input type="number" min="0" inputMode="numeric" className={inputCls} value={form.total_cases} onChange={(e) => set("total_cases", e.target.value)} />
        </Field>
        <Field label={t("order.pallets")}>
          <input type="number" min="0" inputMode="numeric" className={inputCls} value={form.pallets} onChange={(e) => set("pallets", e.target.value)} />
        </Field>
      </div>
      {prep && (
        <>
          <Field label={t("order.shipMethod")}>{select("ship_method", SHIP_METHODS, "shipMethod")}</Field>
          <Field label={t("order.shipmentCreator")}>{select("shipment_creator", CREATORS, "shipmentCreator")}</Field>
          <Field label={t("order.storage")}>{select("storage_requested", STORAGE, "storage")}</Field>
          <div>
            <span className="block text-xs font-semibold text-gray-500 mb-1">{t("order.extras")}</span>
            <div className="grid gap-2">
              {EXTRAS.map((x) => (
                <label key={x} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="accent-third" checked={form.extras.includes(x)} onChange={() => toggleExtra(x)} />
                  {t(`extras.${x}`)}
                </label>
              ))}
            </div>
            {form.extras.includes("custom_label") && <p className="text-[11px] text-gray-400 mt-1">{t("summaryEdit.customLabelHint")}</p>}
          </div>
        </>
      )}
      <Field label={t("order.estimate")} hint={t("summaryEdit.estimateHint")}>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          className={inputCls}
          value={form.estimated_cost}
          onChange={(e) => {
            setCostTouched(true);
            set("estimated_cost", e.target.value);
          }}
        />
      </Field>
      <Field label={t("order.notes")}>
        <textarea className={inputCls} rows={3} value={form.client_notes} onChange={(e) => set("client_notes", e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={busy} className={btnPrimary}>{busy ? t("common.saving") : t("common.save")}</button>
        <button type="button" onClick={() => onDone(false)} className={btnSecondary}>{t("common.cancel")}</button>
      </div>
      {error && <ErrorBanner message={error} />}
    </div>
  );
};

export default SummaryEditor;
