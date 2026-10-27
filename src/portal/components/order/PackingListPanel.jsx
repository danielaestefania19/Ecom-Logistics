import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { uploadOrderFile } from "../../lib/orders";
import { btnPrimary, btnSecondary, ErrorBanner } from "../ui";

const num = "w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right";
const DIMS = ["length_in", "width_in", "height_in", "weight_lb"];

const toForm = (boxes) =>
  [...boxes]
    .sort((a, b) => a.position - b.position)
    .map((b) => ({
      kind: b.kind,
      qty: b.qty,
      length_in: b.length_in,
      width_in: b.width_in,
      height_in: b.height_in,
      weight_lb: b.weight_lb,
      contents: Object.fromEntries(b.packing_box_contents.map((c) => [c.order_item_id, c.units])),
    }));

const blankBox = (kind) => ({ kind, qty: 1, length_in: "", width_in: "", height_in: "", weight_lb: "", contents: {} });

// Labels uploaded after the packing list went out are the client's Amazon labels for this shipment.
export const labelsAfterPacking = (order) =>
  order.packing_sent_at
    ? (order.order_files ?? []).filter((f) => f.kind === "labels" && new Date(f.created_at) >= new Date(order.packing_sent_at))
    : [];

// After prep, staff record each box or pallet and send the list to the client, who creates the
// Amazon shipment and uploads the 4x6 FBA + carrier labels here.
const PackingListPanel = ({ order, isStaff, onChanged }) => {
  const { t, fmtDateTime } = useT();
  const items = order.order_items;
  const saved = toForm(order.packing_boxes ?? []);
  const [editing, setEditing] = useState(false);
  const [boxes, setBoxes] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!editing) setBoxes(toForm(order.packing_boxes ?? []));
  }, [order.packing_boxes, editing]);

  const list = editing ? boxes : saved;
  const skuOf = (id) => items.find((i) => i.id === id)?.sku ?? "?";
  const unitName = (b) => t(`packing.kind.${b.kind}${Number(b.qty) > 1 ? "_many" : ""}`);
  const lineText = (b) =>
    `${b.qty} × ${unitName(b)} · ${b.length_in} × ${b.width_in} × ${b.height_in} in · ${b.weight_lb} lb ${t("packing.each")} · ` +
    Object.entries(b.contents)
      .filter(([, u]) => Number(u) > 0)
      .map(([id, u]) => `${skuOf(id)} × ${u}`)
      .join(", ");
  const count = list.reduce((n, b) => n + (Number(b.qty) || 0), 0);
  const weight = list.reduce((n, b) => n + (Number(b.qty) || 0) * (Number(b.weight_lb) || 0), 0);
  // Units going to Amazon now: good units minus what stays in storage.
  const toShip = (i) => Math.max((i.received_qty ?? i.expected_qty) - (i.damaged_qty ?? 0) - (i.stored_qty ?? 0), 0);
  const packed = (i) => list.reduce((n, b) => n + (Number(b.qty) || 0) * (Number(b.contents[i.id]) || 0), 0);
  const labels = labelsAfterPacking(order);

  const setBox = (idx, patch) => setBoxes((bs) => bs.map((b, k) => (k === idx ? { ...b, ...patch } : b)));
  const setUnits = (idx, itemId, v) => setBoxes((bs) => bs.map((b, k) => (k === idx ? { ...b, contents: { ...b.contents, [itemId]: v } } : b)));

  const save = async () => {
    if (boxes.some((b) => DIMS.some((d) => !(Number(b[d]) > 0)) || !(Number(b.qty) > 0))) return setError(t("packing.incomplete"));
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("save_packing_list", {
      p_order: order.id,
      p_boxes: boxes.map((b) => ({
        ...b,
        contents: Object.entries(b.contents).map(([order_item_id, units]) => ({ order_item_id, units: Number(units) || 0 })),
      })),
    });
    setBusy(false);
    if (err) return setError(err.message);
    setEditing(false);
    onChanged();
  };

  const send = async () => {
    if (!window.confirm(t("packing.sendConfirm"))) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("send_packing_list", { p_order: order.id });
    setBusy(false);
    if (err) return setError(err.message);
    onChanged();
  };

  const copy = async () => {
    const text = [...list.map(lineText), `${t("packing.total")}: ${count} · ${weight.toFixed(1)} lb`].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard blocked: the list stays visible to copy by hand.
    }
  };

  const upload = async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const f of files) await uploadOrderFile(order.id, f, "labels");
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {order.packing_sent_at && (
        <p className="text-sm text-gray-600">{t("packing.sentAt", { date: fmtDateTime(order.packing_sent_at) })}</p>
      )}

      {editing ? (
        <div className="space-y-3">
          {boxes.map((b, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 items-end">
                <label className="text-[11px] font-semibold text-gray-400">{t("packing.type")}
                  <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={b.kind} onChange={(e) => setBox(idx, { kind: e.target.value })}>
                    <option value="box">{t("packing.kind.box")}</option>
                    <option value="pallet">{t("packing.kind.pallet")}</option>
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-gray-400">{t("packing.qty")}
                  <input type="number" min="1" className={num} value={b.qty} onChange={(e) => setBox(idx, { qty: e.target.value })} />
                </label>
                {DIMS.map((d) => (
                  <label key={d} className="text-[11px] font-semibold text-gray-400">{t(`packing.${d}`)}
                    <input type="number" min="0" step="0.1" className={num} value={b[d]} onChange={(e) => setBox(idx, { [d]: e.target.value })} />
                  </label>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 items-end">
                <span className="text-[11px] font-semibold text-gray-400 w-full">{t("packing.unitsPerBox")}</span>
                {items.map((i) => (
                  <label key={i.id} className="flex items-center gap-1 text-xs text-gray-600">
                    {i.sku}
                    <input type="number" min="0" className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-right" value={b.contents[i.id] ?? ""} onChange={(e) => setUnits(idx, i.id, e.target.value)} />
                  </label>
                ))}
                <button type="button" onClick={() => setBoxes((bs) => bs.filter((_, k) => k !== idx))} className="ml-auto text-xs font-semibold text-gray-400 hover:text-red-600">
                  {t("packing.remove")}
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setBoxes((bs) => [...bs, blankBox("box")])} className={btnSecondary}>+ {t("packing.kind.box")}</button>
            <button type="button" onClick={() => setBoxes((bs) => [...bs, blankBox("pallet")])} className={btnSecondary}>+ {t("packing.kind.pallet")}</button>
          </div>
        </div>
      ) : list.length ? (
        <ul className="space-y-1.5 text-sm text-gray-700">
          {list.map((b, idx) => <li key={idx}>{lineText(b)}</li>)}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">{t("packing.empty")}</p>
      )}

      {list.length > 0 && (
        <p className="text-sm font-semibold text-primary">{t("packing.total")}: {count} · {weight.toFixed(1)} lb</p>
      )}

      {isStaff && list.length > 0 && (
        <ul className="text-xs space-y-0.5">
          {items.map((i) => (
            <li key={i.id} className={packed(i) === toShip(i) ? "text-green-700" : "text-amber-700"}>
              {i.sku}: {t("packing.packedOf", { n: packed(i), of: toShip(i) })}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {isStaff && editing && (
          <>
            <button type="button" onClick={save} disabled={busy} className={btnPrimary}>{busy ? t("common.saving") : t("common.save")}</button>
            <button type="button" onClick={() => setEditing(false)} className={btnSecondary}>{t("common.cancel")}</button>
          </>
        )}
        {isStaff && !editing && (
          <>
            <button type="button" onClick={() => setEditing(true)} className={btnSecondary}>{list.length ? t("packing.edit") : t("packing.create")}</button>
            {saved.length > 0 && (
              <button type="button" onClick={send} disabled={busy} className={btnPrimary}>
                {order.packing_sent_at ? t("packing.resend") : t("packing.send")}
              </button>
            )}
          </>
        )}
        {!editing && list.length > 0 && (
          <button type="button" onClick={copy} className="text-xs font-semibold text-third hover:underline">{copied ? t("packing.copied") : t("packing.copy")}</button>
        )}
      </div>

      {order.packing_sent_at && (
        <div className="border-t border-gray-100 pt-4 space-y-2">
          {labels.length ? (
            <p className="text-sm font-semibold text-green-700">✓ {t("packing.labelsReceived", { n: labels.length })}</p>
          ) : (
            <p className="text-sm text-amber-800">{t(isStaff ? "packing.waitingLabels" : "packing.uploadLabelsHint")}</p>
          )}
          <label className={`inline-block cursor-pointer text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:border-third hover:text-third transition ${busy ? "opacity-50 pointer-events-none" : ""}`}>
            {t("packing.uploadLabels")}
            <input type="file" multiple accept="application/pdf,image/*" className="hidden" onChange={upload} />
          </label>
        </div>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
};

export default PackingListPanel;
