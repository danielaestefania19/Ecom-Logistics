import { Fragment, useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { btnPrimary, btnSecondary, ErrorBanner } from "../ui";

const PREP_TYPES = ["standard", "oversize", "polybag", "bubble", "bundle"];
const cellInput = "w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm";

// Staff fix what the client got wrong: SKU, name, FNSKU, UPC and prep type (it often turns out
// polybag rather than standard). UPCs live per client in sku_barcodes so the scanner knows them too.
function ItemEditor({ item, upc, clientId, showPrep, onDone }) {
  const { t } = useT();
  const [form, setForm] = useState({
    sku: item.sku,
    product_name: item.product_name ?? "",
    fnsku: item.fnsku ?? "",
    upc: upc ?? "",
    prep_type: item.prep_type,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const sku = form.sku.trim();
    if (!sku) return setError(t("newOrder.errors.badItem"));
    setBusy(true);
    setError(null);
    const { error: err } = await supabase
      .from("order_items")
      .update({
        sku,
        product_name: form.product_name.trim() || null,
        fnsku: form.fnsku.trim().toUpperCase() || null,
        prep_type: form.prep_type,
      })
      .eq("id", item.id);
    if (err) {
      setBusy(false);
      return setError(err.message);
    }

    const code = form.upc.trim().toUpperCase().replace(/\s+/g, "");
    const old = (upc ?? "").toUpperCase();
    if (old && (old !== code || sku !== item.sku)) {
      await supabase.from("sku_barcodes").delete().eq("client_id", clientId).eq("code", old);
    }
    if (code) {
      const { error: upcErr } = await supabase
        .from("sku_barcodes")
        .upsert({ client_id: clientId, code, sku, kind: "upc" }, { onConflict: "client_id,code" });
      if (upcErr) {
        setBusy(false);
        return setError(upcErr.message);
      }
    }
    setBusy(false);
    onDone(true);
  };

  return (
    <div className="grid sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
      <label className="text-[11px] font-semibold text-gray-400">{t("item.sku")}
        <input className={cellInput} value={form.sku} onChange={(e) => set("sku", e.target.value)} />
      </label>
      <label className="text-[11px] font-semibold text-gray-400">{t("item.productName")}
        <input className={cellInput} value={form.product_name} onChange={(e) => set("product_name", e.target.value)} />
      </label>
      <label className="text-[11px] font-semibold text-gray-400">{t("item.fnsku")}
        <input className={`${cellInput} font-mono`} value={form.fnsku} onChange={(e) => set("fnsku", e.target.value)} placeholder="X00…" />
      </label>
      <label className="text-[11px] font-semibold text-gray-400">{t("item.upc")}
        <input className={`${cellInput} font-mono`} value={form.upc} onChange={(e) => set("upc", e.target.value)} inputMode="numeric" />
      </label>
      {showPrep && (
        <label className="text-[11px] font-semibold text-gray-400 sm:col-span-2">{t("item.prepType")}
          <select className={cellInput} value={form.prep_type} onChange={(e) => set("prep_type", e.target.value)}>
            {PREP_TYPES.map((p) => <option key={p} value={p}>{t(`prepType.${p}`)}</option>)}
          </select>
        </label>
      )}
      <div className="sm:col-span-2 flex items-center gap-2">
        <button type="button" onClick={save} disabled={busy} className={btnPrimary}>{busy ? t("common.saving") : t("common.save")}</button>
        <button type="button" onClick={() => onDone(false)} className={btnSecondary}>{t("common.cancel")}</button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}

const toState = (items) =>
  Object.fromEntries(items.map((i) => [i.id, { received: i.received_qty ?? "", damaged: i.damaged_qty ?? 0 }]));

const ItemsTable = ({ items, editable, onSaved, showPrep = true, showPrepped = false, canEditItems = false, clientId }) => {
  const { t } = useT();
  const [upcs, setUpcs] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Known UPCs per SKU (staff only; RLS returns nothing to clients).
  const loadUpcs = useCallback(async () => {
    if (!clientId) return;
    const { data } = await supabase.from("sku_barcodes").select("code, sku").eq("client_id", clientId).eq("kind", "upc");
    setUpcs(Object.fromEntries((data ?? []).map((b) => [b.sku, b.code])));
  }, [clientId]);

  useEffect(() => {
    loadUpcs();
  }, [loadUpcs, items]);
  const [counts, setCounts] = useState(() => toState(items));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => setCounts(toState(items)), [items]);

  const setCount = (id, key, value) => {
    setSaved(false);
    setCounts((c) => ({ ...c, [id]: { ...c[id], [key]: value } }));
  };

  const changed = items.filter((i) => {
    const c = counts[i.id];
    return c && (String(c.received) !== String(i.received_qty ?? "") || Number(c.damaged) !== (i.damaged_qty ?? 0));
  });

  const save = async () => {
    setSaving(true);
    setError(null);
    for (const i of changed) {
      const c = counts[i.id];
      const { error: err } = await supabase
        .from("order_items")
        .update({ received_qty: c.received === "" ? null : Number(c.received), damaged_qty: Number(c.damaged) || 0 })
        .eq("id", i.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setSaved(true);
    onSaved?.();
  };

  const totals = items.reduce(
    (acc, i) => ({
      expected: acc.expected + i.expected_qty,
      received: acc.received + (i.received_qty ?? 0),
      damaged: acc.damaged + (i.damaged_qty ?? 0),
    }),
    { expected: 0, received: 0, damaged: 0 }
  );
  const counted = items.some((i) => i.received_qty != null);

  return (
    <div>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
              <th className="py-2 pr-3 font-semibold">{t("item.sku")}</th>
              {showPrep && <th className="py-2 pr-3 font-semibold">{t("item.prepType")}</th>}
              <th className="py-2 pr-3 font-semibold text-right">{t("item.expected")}</th>
              <th className="py-2 pr-3 font-semibold text-right">{t("item.received")}</th>
              <th className="py-2 font-semibold text-right">{t("item.damaged")}</th>
              {showPrepped && <th className="py-2 pl-3 font-semibold text-right">{t("item.prepped")}</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const c = counts[i.id] ?? { received: "", damaged: 0 };
              const mismatch = i.received_qty != null && i.received_qty !== i.expected_qty;
              return (
                <Fragment key={i.id}>
                <tr className="border-t border-gray-100 align-middle">
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-primary">
                      {i.sku}
                      {canEditItems && editingId !== i.id && (
                        <button type="button" onClick={() => setEditingId(i.id)} className="ml-2 text-xs font-semibold text-third hover:underline">
                          {t("item.edit")}
                        </button>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {[i.product_name, i.fnsku && `FNSKU ${i.fnsku}`, upcs[i.sku] && `UPC ${upcs[i.sku]}`].filter(Boolean).join(" · ")}
                    </p>
                  </td>
                  {showPrep && <td className="py-3 pr-3 text-gray-600">{t(`prepType.${i.prep_type}`)}</td>}
                  <td className="py-3 pr-3 text-right font-medium">{i.expected_qty}</td>
                  <td className="py-3 pr-3 text-right">
                    {editable ? (
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={c.received}
                        onChange={(e) => setCount(i.id, "received", e.target.value)}
                        className="w-24 border border-gray-200 rounded-lg px-2 py-2 text-right text-base"
                      />
                    ) : (
                      <span className={mismatch ? "text-red-600 font-semibold" : ""}>{i.received_qty ?? "—"}</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {editable ? (
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={c.damaged}
                        onChange={(e) => setCount(i.id, "damaged", e.target.value)}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-right text-base"
                      />
                    ) : (
                      <span className={i.damaged_qty ? "text-red-600 font-semibold" : ""}>{i.damaged_qty || "—"}</span>
                    )}
                  </td>
                  {showPrepped && (
                    <td className={`py-3 pl-3 text-right font-semibold ${i.prepped_qty >= i.expected_qty ? "text-green-700" : "text-amber-700"}`}>
                      {i.prepped_qty}/{i.expected_qty}
                    </td>
                  )}
                </tr>
                {editingId === i.id && (
                  <tr>
                    <td colSpan={4 + (showPrep ? 1 : 0) + (showPrepped ? 1 : 0)} className="pb-3">
                      <ItemEditor
                        item={i}
                        upc={upcs[i.sku]}
                        clientId={clientId}
                        showPrep={showPrep}
                        onDone={(saved) => {
                          setEditingId(null);
                          if (saved) onSaved?.();
                        }}
                      />
                    </td>
                  </tr>
                )}
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 font-bold text-primary">
              <td className="py-3" colSpan={showPrep ? 2 : 1}>{t("item.total")}</td>
              <td className="py-3 pr-3 text-right">{totals.expected}</td>
              <td className={`py-3 pr-3 text-right ${counted && totals.received !== totals.expected ? "text-red-600" : ""}`}>
                {counted ? totals.received : "—"}
              </td>
              <td className="py-3 text-right">{totals.damaged || "—"}</td>
              {showPrepped && <td className="py-3 pl-3 text-right">{items.reduce((n, i) => n + i.prepped_qty, 0)}</td>}
            </tr>
          </tfoot>
        </table>
      </div>

      {editable && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={saving || changed.length === 0} className={btnPrimary}>
            {saving ? t("common.saving") : t("item.saveCount")}
          </button>
          {saved && <span className="text-sm text-green-600">{t("common.saved")}</span>}
          {counted && totals.received !== totals.expected && (
            <span className="text-sm text-red-600">{t("item.mismatchHint")}</span>
          )}
        </div>
      )}
      {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
    </div>
  );
};

export default ItemsTable;
