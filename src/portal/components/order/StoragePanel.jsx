import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { btnPrimary, btnSecondary, ErrorBanner, inputCls } from "../ui";

const FREE_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;
const numInput = "w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-right";
const RELEASE_STYLE = {
  requested: "bg-amber-50 text-amber-800 border border-amber-200",
  shipped: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-gray-100 text-gray-400 border border-gray-200 line-through",
};

const goodUnits = (i) => Math.max((i.received_qty ?? i.expected_qty) - (i.damaged_qty ?? 0), 0);

// Units of each item promised to releases, by status.
function releasedBy(releases, status) {
  const out = {};
  for (const r of releases) {
    if (!status.includes(r.status)) continue;
    for (const l of r.storage_release_lines) out[l.order_item_id] = (out[l.order_item_id] ?? 0) + l.qty;
  }
  return out;
}

// Part of a PREP order stays in storage after prep; the client asks to send stored units out
// in releases, which staff ship. Storage billing stays manual: this shows the days for it.
const StoragePanel = ({ order, isStaff, onChanged }) => {
  const { t, fmtDate } = useT();
  const items = order.order_items;
  const releases = [...(order.storage_releases ?? [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const shipped = releasedBy(releases, ["shipped"]);
  const pending = releasedBy(releases, ["requested"]);
  const available = (i) => i.stored_qty - (shipped[i.id] ?? 0) - (pending[i.id] ?? 0);
  const totalStored = items.reduce((n, i) => n + i.stored_qty, 0);
  const totalAvailable = items.reduce((n, i) => n + available(i), 0);

  const [editing, setEditing] = useState(false);
  const [split, setSplit] = useState({});
  const [request, setRequest] = useState({});
  const [notes, setNotes] = useState("");
  const [tracking, setTracking] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => setSplit(Object.fromEntries(items.map((i) => [i.id, i.stored_qty]))), [items]);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    const { error: err } = await fn();
    setBusy(false);
    if (err) return setError(err.message);
    onChanged();
    return true;
  };

  const saveSplit = async () => {
    const ok = await run(() =>
      supabase.rpc("set_storage_split", {
        p_order: order.id,
        p_items: items.map((i) => ({ id: i.id, stored_qty: Number(split[i.id]) || 0 })),
      }),
    );
    if (ok) setEditing(false);
  };

  const requestRelease = async () => {
    const lines = items.map((i) => ({ order_item_id: i.id, qty: Number(request[i.id]) || 0 })).filter((l) => l.qty > 0);
    if (!lines.length) return setError(t("storagePanel.chooseQty"));
    const ok = await run(() => supabase.rpc("request_storage_release", { p_order: order.id, p_lines: lines, p_notes: notes }));
    if (ok) {
      setRequest({});
      setNotes("");
    }
  };

  const setReleaseStatus = (r, status) =>
    run(() => supabase.rpc("set_storage_release_status", { p_release: r.id, p_status: status, p_tracking: tracking[r.id] ?? null }));

  if (!isStaff && totalStored === 0) return null;

  const days = order.stored_at ? Math.floor((Date.now() - new Date(order.stored_at)) / DAY) + 1 : 0;

  return (
    <div className="space-y-5">
      {order.stored_at ? (
        <p className="text-sm text-gray-600">
          {t("storagePanel.since", { date: fmtDate(order.stored_at), days })}{" "}
          <span className={days > FREE_DAYS ? "text-amber-700 font-semibold" : "text-green-700 font-semibold"}>
            {days > FREE_DAYS ? t("storagePanel.billable", { days: days - FREE_DAYS }) : t("storagePanel.free", { left: FREE_DAYS - days + 1 })}
          </span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">{t("storagePanel.none")}</p>
      )}

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
              <th className="py-2 pr-3 font-semibold">{t("item.sku")}</th>
              <th className="py-2 pr-3 font-semibold text-right">{t("storagePanel.good")}</th>
              <th className="py-2 pr-3 font-semibold text-right">{t("storagePanel.stored")}</th>
              <th className="py-2 pr-3 font-semibold text-right">{t("storagePanel.sentOut")}</th>
              <th className="py-2 font-semibold text-right">{t("storagePanel.available")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-gray-100">
                <td className="py-2.5 pr-3 font-semibold text-primary">{i.sku}</td>
                <td className="py-2.5 pr-3 text-right text-gray-600">{goodUnits(i)}</td>
                <td className="py-2.5 pr-3 text-right">
                  {editing ? (
                    <input type="number" min="0" max={goodUnits(i)} className={numInput} value={split[i.id] ?? 0} onChange={(e) => setSplit((s) => ({ ...s, [i.id]: e.target.value }))} />
                  ) : (
                    <span className="font-medium">{i.stored_qty}</span>
                  )}
                </td>
                <td className="py-2.5 pr-3 text-right text-gray-600">
                  {shipped[i.id] ?? 0}
                  {pending[i.id] ? <span className="text-amber-700"> (+{pending[i.id]})</span> : null}
                </td>
                <td className="py-2.5 text-right font-semibold text-primary">{available(i)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isStaff && (
        <div className="flex flex-wrap items-center gap-2">
          {editing ? (
            <>
              <button type="button" onClick={saveSplit} disabled={busy} className={btnPrimary}>{busy ? t("common.saving") : t("common.save")}</button>
              <button type="button" onClick={() => setEditing(false)} className={btnSecondary}>{t("common.cancel")}</button>
            </>
          ) : (
            <button type="button" onClick={() => setEditing(true)} className={btnSecondary}>{t("storagePanel.editSplit")}</button>
          )}
          <span className="text-xs text-gray-400">{t("storagePanel.splitHint")}</span>
        </div>
      )}

      {totalAvailable > 0 && !editing && (
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <p className="text-sm font-semibold text-primary">{t("storagePanel.requestTitle")}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {items.filter((i) => available(i) > 0).map((i) => (
              <label key={i.id} className="flex items-center justify-between gap-3 text-sm border border-gray-100 rounded-xl px-3 py-2">
                <span>
                  <span className="font-semibold text-primary">{i.sku}</span>
                  <span className="text-xs text-gray-400"> · {t("storagePanel.max", { n: available(i) })}</span>
                </span>
                <input type="number" min="0" max={available(i)} className={numInput} value={request[i.id] ?? ""} onChange={(e) => setRequest((r) => ({ ...r, [i.id]: e.target.value }))} />
              </label>
            ))}
          </div>
          <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("storagePanel.notesPlaceholder")} />
          <button type="button" onClick={requestRelease} disabled={busy} className={btnPrimary}>{busy ? t("common.saving") : t("storagePanel.request")}</button>
        </div>
      )}

      {releases.length > 0 && (
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <p className="text-sm font-semibold text-primary">{t("storagePanel.releases")}</p>
          {releases.map((r) => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-primary">#{r.number}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RELEASE_STYLE[r.status]}`}>{t(`storagePanel.status.${r.status}`)}</span>
                <span className="text-xs text-gray-400">{fmtDate(r.shipped_at ?? r.created_at)}</span>
                {r.tracking && <span className="text-xs font-mono text-gray-500">{r.tracking}</span>}
              </div>
              <p className="text-sm text-gray-600">
                {r.storage_release_lines.map((l) => `${items.find((i) => i.id === l.order_item_id)?.sku ?? "?"} × ${l.qty}`).join(" · ")}
              </p>
              {r.notes && <p className="text-xs text-gray-500 whitespace-pre-line">{r.notes}</p>}
              {isStaff && r.status === "requested" && (
                <div className="flex flex-wrap items-center gap-2">
                  <input className={`${inputCls} max-w-[220px]`} placeholder={t("storagePanel.trackingPlaceholder")} value={tracking[r.id] ?? ""} onChange={(e) => setTracking((s) => ({ ...s, [r.id]: e.target.value }))} />
                  <button type="button" onClick={() => setReleaseStatus(r, "shipped")} disabled={busy} className={btnPrimary}>{t("storagePanel.markShipped")}</button>
                  <button type="button" onClick={() => setReleaseStatus(r, "cancelled")} disabled={busy} className={btnSecondary}>{t("common.cancel")}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
};

export default StoragePanel;
