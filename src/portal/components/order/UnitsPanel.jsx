import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { orderEstimate } from "../../lib/estimate";
import { btnPrimary, btnSecondary, ErrorBanner, inputCls } from "../ui";

const PREP_TYPES = ["standard", "oversize", "polybag", "bubble", "bundle"];
const cellInput = "w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm";
// Same window the database allows: units are fixed once prep starts.
export const UNIT_STAGES = new Set(["quote", "awaiting_inventory", "received", "discrepancy", "scheduled"]);

const emptyLine = () => ({ sku: "", product_name: "", fnsku: "", prep_type: "standard", qty: "" });
const wholePositive = (v) => /^\d+$/.test(String(v).trim()) && Number(v) > 0;

// The order's items after a change, for the new estimate.
const applyChanges = (items, changes) => {
  const byId = Object.fromEntries(changes.filter((c) => c.id).map((c) => [c.id, c]));
  return [
    ...items.filter((i) => !byId[i.id]?.remove).map((i) => (byId[i.id] ? { ...i, expected_qty: byId[i.id].expected_qty } : i)),
    ...changes.filter((c) => !c.id),
  ];
};

// Saves the new estimated cost after units change, so the order and the quote start from it.
async function refreshEstimate(order) {
  const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
  const total = orderEstimate(order, data ?? []).total;
  await supabase.from("orders").update({ estimated_cost: total || null }).eq("id", order.id);
}

function ChangeRows({ items, changes }) {
  const { t } = useT();
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  return (
    <ul className="text-sm space-y-1">
      {changes.map((c, n) => {
        const item = c.id ? byId[c.id] : null;
        return (
          <li key={n} className="flex justify-between gap-3">
            <span className="font-semibold text-primary">{item?.sku ?? c.sku ?? "—"}</span>
            <span className="text-gray-600">
              {item && c.remove
                ? t("units.removeLine")
                : item
                  ? `${item.expected_qty} → ${c.expected_qty}`
                  : t("units.newLine", { n: c.expected_qty })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function PendingRequest({ order, request, isAdmin, names, onChanged }) {
  const { t, fmtDateTime } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const decide = async (approve) => {
    if (!approve && !window.confirm(t("units.rejectConfirm"))) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("decide_order_change", { p_request: request.id, p_approve: approve });
    if (!err && approve) await refreshEstimate(order);
    setBusy(false);
    if (err) return setError(err.message);
    onChanged();
  };

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-sm font-bold text-amber-900">{t("units.pendingTitle")}</p>
        <p className="text-xs text-amber-800">
          {t("units.requestedBy", { name: names?.[request.requested_by] || t("timeline.team"), date: fmtDateTime(request.created_at) })}
        </p>
      </div>
      <ChangeRows items={order.order_items} changes={request.items} />
      {request.reason && <p className="text-sm text-gray-700 italic">“{request.reason}”</p>}
      {isAdmin ? (
        <div className="flex gap-2">
          <button type="button" onClick={() => decide(true)} disabled={busy} className={btnPrimary}>{t("units.approve")}</button>
          <button type="button" onClick={() => decide(false)} disabled={busy} className={btnSecondary}>{t("units.reject")}</button>
        </div>
      ) : (
        <p className="text-xs text-amber-800">{t("units.waitingAdmin")}</p>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

// Admins change units straight away; other staff send the same change to an admin for approval.
function UnitsForm({ order, isAdmin, onDone }) {
  const { t, fmtMoney } = useT();
  const items = order.order_items;
  const prep = order.type !== "3pl";
  const [qty, setQty] = useState(() => Object.fromEntries(items.map((i) => [i.id, String(i.expected_qty)])));
  const [removed, setRemoved] = useState({});
  const [added, setAdded] = useState([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const setLine = (n, k, v) => setAdded((list) => list.map((l, i) => (i === n ? { ...l, [k]: v } : l)));
  const newLines = added.filter((l) => l.sku.trim() || String(l.qty).trim());

  const valid = items.every((i) => removed[i.id] || wholePositive(qty[i.id])) && newLines.every((l) => l.sku.trim() && wholePositive(l.qty));
  const changes = valid
    ? [
        ...items.flatMap((i) => {
          if (removed[i.id]) return [{ id: i.id, remove: true }];
          return Number(qty[i.id]) !== i.expected_qty ? [{ id: i.id, expected_qty: Number(qty[i.id]) }] : [];
        }),
        ...newLines.map((l) => ({
          sku: l.sku.trim(),
          product_name: l.product_name.trim(),
          fnsku: l.fnsku.trim(),
          prep_type: l.prep_type,
          expected_qty: Number(l.qty),
        })),
      ]
    : [];
  const was = orderEstimate(order).total;
  const next = changes.length ? orderEstimate(order, applyChanges(items, changes)).total : was;

  const submit = async () => {
    if (!valid) return setError(t("units.badQty"));
    if (!changes.length) return setError(t("units.nothing"));
    if (!isAdmin && !reason.trim()) return setError(t("units.reasonMissing"));
    setBusy(true);
    setError(null);
    const { error: err } = isAdmin
      ? await supabase.rpc("update_order_items", { p_order: order.id, p_items: changes, p_reason: reason.trim() || null })
      : await supabase.rpc("request_order_change", { p_order: order.id, p_items: changes, p_reason: reason.trim() });
    if (!err && isAdmin) await refreshEstimate(order);
    setBusy(false);
    if (err) return setError(err.message);
    onDone(!isAdmin);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
      {!isAdmin && <p className="text-xs text-gray-500">{t("units.adminOnly")}</p>}
      <ul className="space-y-2">
        {items.map((i) => {
          const locked = (i.received_qty ?? 0) > 0;
          return (
            <li key={i.id} className="flex items-center gap-3">
              <span className={`flex-1 min-w-0 text-sm font-semibold truncate ${removed[i.id] ? "line-through text-gray-400" : "text-primary"}`}>
                {i.sku}
                {i.received_qty != null && <span className="ml-2 text-xs font-normal text-gray-400">{t("units.receivedN", { n: i.received_qty })}</span>}
              </span>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-right text-sm"
                value={qty[i.id]}
                disabled={!!removed[i.id]}
                onChange={(e) => setQty((q) => ({ ...q, [i.id]: e.target.value }))}
              />
              <label className={`flex items-center gap-1.5 text-xs ${locked ? "text-gray-300" : "text-gray-500"}`} title={locked ? t("units.removeLocked") : undefined}>
                <input
                  type="checkbox"
                  className="accent-red-600"
                  disabled={locked}
                  checked={!!removed[i.id]}
                  onChange={(e) => setRemoved((r) => ({ ...r, [i.id]: e.target.checked }))}
                />
                {t("units.remove")}
              </label>
            </li>
          );
        })}
      </ul>

      {added.map((l, n) => (
        <div key={n} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end border-t border-gray-200 pt-3">
          <label className="text-[11px] font-semibold text-gray-400 sm:col-span-2">{t("item.sku")}
            <input className={cellInput} value={l.sku} onChange={(e) => setLine(n, "sku", e.target.value)} />
          </label>
          <label className="text-[11px] font-semibold text-gray-400 sm:col-span-2">{t("item.productName")}
            <input className={cellInput} value={l.product_name} onChange={(e) => setLine(n, "product_name", e.target.value)} />
          </label>
          <label className="text-[11px] font-semibold text-gray-400">{t("item.units")}
            <input type="number" min="1" inputMode="numeric" className={`${cellInput} text-right`} value={l.qty} onChange={(e) => setLine(n, "qty", e.target.value)} />
          </label>
          <button type="button" onClick={() => setAdded((list) => list.filter((_, i) => i !== n))} className="text-xs font-semibold text-gray-400 hover:text-red-600 pb-2">
            {t("units.remove")}
          </button>
          <label className="text-[11px] font-semibold text-gray-400 sm:col-span-3">{t("item.fnsku")}
            <input className={`${cellInput} font-mono`} value={l.fnsku} onChange={(e) => setLine(n, "fnsku", e.target.value)} placeholder="X00…" />
          </label>
          {prep && (
            <label className="text-[11px] font-semibold text-gray-400 sm:col-span-3">{t("item.prepType")}
              <select className={cellInput} value={l.prep_type} onChange={(e) => setLine(n, "prep_type", e.target.value)}>
                {PREP_TYPES.map((p) => <option key={p} value={p}>{t(`prepType.${p}`)}</option>)}
              </select>
            </label>
          )}
        </div>
      ))}
      <button type="button" onClick={() => setAdded((list) => [...list, emptyLine()])} className="text-sm font-semibold text-third hover:underline">
        + {t("units.addSku")}
      </button>

      <textarea
        className={inputCls}
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={isAdmin ? t("units.reasonAdmin") : t("units.reasonStaff")}
      />
      {changes.length > 0 && next !== was && (
        <p className="text-sm text-gray-600">{t("units.newEstimate", { total: fmtMoney(next), was: fmtMoney(was) })}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={submit} disabled={busy} className={btnPrimary}>
          {busy ? t("common.saving") : isAdmin ? t("units.save") : t("units.sendRequest")}
        </button>
        <button type="button" onClick={() => onDone(false)} className={btnSecondary}>{t("common.cancel")}</button>
      </div>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

// When the count doesn't match, an admin can take what arrived as the new order quantities.
function AcceptReceived({ order, isAdmin, onChanged }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const received = order.order_items.reduce((n, i) => n + (i.received_qty ?? 0), 0);

  if (!isAdmin) return <p className="text-xs text-gray-500">{t("units.acceptReceivedStaff")}</p>;

  const accept = async () => {
    if (!window.confirm(t("units.acceptReceivedConfirm", { n: received }))) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("accept_received_counts", { p_order: order.id });
    if (!err) await refreshEstimate(order);
    setBusy(false);
    if (err) return setError(err.message);
    onChanged();
  };

  return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-4 space-y-2">
      <p className="text-sm text-red-800">{t("units.acceptReceivedHelp", { n: received })}</p>
      <button type="button" onClick={accept} disabled={busy} className={btnPrimary}>
        {busy ? t("common.saving") : t("units.acceptReceived")}
      </button>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

const UnitsPanel = ({ order, isAdmin, names, onChanged }) => {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const pending = (order.order_change_requests ?? []).filter((r) => r.status === "pending");

  return (
    <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
      {order.stage === "discrepancy" && <AcceptReceived order={order} isAdmin={isAdmin} onChanged={onChanged} />}
      {pending.map((r) => (
        <PendingRequest key={r.id} order={order} request={r} isAdmin={isAdmin} names={names} onChanged={onChanged} />
      ))}
      {open ? (
        <UnitsForm
          order={order}
          isAdmin={isAdmin}
          onDone={(requested) => {
            setOpen(false);
            setSent(requested);
            onChanged();
          }}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => { setSent(false); setOpen(true); }} className={btnSecondary}>
            {isAdmin ? t("units.change") : t("units.request")}
          </button>
          {sent && <span className="text-sm text-green-600">{t("units.requestSent")}</span>}
        </div>
      )}
    </div>
  );
};

export default UnitsPanel;
