import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { btnPrimary, ErrorBanner } from "../ui";

const toState = (items) =>
  Object.fromEntries(items.map((i) => [i.id, { received: i.received_qty ?? "", damaged: i.damaged_qty ?? 0 }]));

const ItemsTable = ({ items, editable, onSaved, showPrep = true }) => {
  const { t } = useT();
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
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const c = counts[i.id] ?? { received: "", damaged: 0 };
              const mismatch = i.received_qty != null && i.received_qty !== i.expected_qty;
              return (
                <tr key={i.id} className="border-t border-gray-100 align-middle">
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-primary">{i.sku}</p>
                    <p className="text-xs text-gray-400">{[i.fnsku, i.product_name].filter(Boolean).join(" · ")}</p>
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
                </tr>
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
