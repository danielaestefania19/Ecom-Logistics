import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { quoteDraftLines } from "../../lib/estimate";
import { STRINGS } from "../../strings";
import { btnPrimary, btnSecondary, ErrorBanner, inputCls } from "../ui";

const cellInput = "w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm";
const STATUS_STYLE = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-purple-50 text-purple-700",
  accepted: "bg-green-50 text-green-700",
  changes_requested: "bg-amber-50 text-amber-800",
};

const sortedLines = (order) => [...(order.order_quote_lines ?? [])].sort((a, b) => a.position - b.position);
export const quoteTotal = (lines) => lines.reduce((n, l) => n + Number(l.quantity) * Number(l.unit_amount), 0) / 100;

const toRows = (lines) =>
  lines.map((l) => ({
    key: l.key ?? null,
    description: l.description,
    quantity: String(Number(l.quantity)),
    price: (Number(l.unit_amount) / 100).toFixed(2),
  }));

const rowAmount = (r) => (Number(r.quantity) || 0) * (Number(r.price) || 0);

export function QuoteStatus({ status }) {
  const { t } = useT();
  if (!status) return null;
  return <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_STYLE[status]}`}>{t(`quote.status.${status}`)}</span>;
}

function LinesTable({ lines }) {
  const { t, fmtMoney } = useT();
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
          <th className="py-2 pr-3 font-semibold">{t("quote.description")}</th>
          <th className="py-2 pr-3 font-semibold text-right">{t("quote.qty")}</th>
          <th className="py-2 pr-3 font-semibold text-right">{t("quote.price")}</th>
          <th className="py-2 font-semibold text-right">{t("quote.total")}</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((l) => (
          <tr key={l.id} className="border-t border-gray-100">
            <td className="py-2.5 pr-3 text-primary">{l.description}</td>
            <td className="py-2.5 pr-3 text-right">{Number(l.quantity)}</td>
            <td className="py-2.5 pr-3 text-right">{fmtMoney(Number(l.unit_amount) / 100)}</td>
            <td className="py-2.5 text-right font-medium">{fmtMoney((Number(l.quantity) * Number(l.unit_amount)) / 100)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-gray-200 font-bold text-primary">
          <td className="py-3" colSpan={3}>{t("quote.total")}</td>
          <td className="py-3 text-right">{fmtMoney(quoteTotal(lines))}</td>
        </tr>
      </tfoot>
    </table>
  );
}

// Staff build the quote from the price list, adjust it (prices, quantities, extra lines, discounts)
// and send it; the client accepts it in the portal and the invoice then uses its prices.
function StaffQuote({ order, onChanged }) {
  const { t, fmtMoney, fmtDate } = useT();
  // The client reads the quote, so its lines are written in the client's language.
  const clientStrings = STRINGS[order.clients?.language === "es" ? "es" : "en"];
  const labels = clientStrings.estimate.line;
  const saved = sortedLines(order);
  const fresh = () => toRows(saved.length ? saved : quoteDraftLines(order, labels));
  const [started, setStarted] = useState(!!order.quote_status);
  const [rows, setRows] = useState(fresh);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // A fresh load shows the saved quote, unless staff are mid-edit.
    if (!dirty) setRows(fresh());
  }, [order]);

  if (order.quote_status === "accepted") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-green-700">{t("quote.acceptedOn", { date: fmtDate(order.quote_accepted_at) })}</p>
        <LinesTable lines={saved} />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">{t("quote.fromPriceList")}</p>
        <button type="button" onClick={() => setStarted(true)} className={btnSecondary}>{t("quote.create")}</button>
      </div>
    );
  }

  const edit = (fn) => {
    setDirty(true);
    setRows(fn);
  };
  const setRow = (n, k, v) => edit((list) => list.map((r, i) => (i === n ? { ...r, [k]: v } : r)));
  const total = rows.reduce((n, r) => n + rowAmount(r), 0);

  const payload = () => {
    if (!rows.length) throw new Error(t("quote.emptyLines"));
    const bad = rows.some((r) => {
      const price = Number(r.price);
      return !r.description.trim() || !(Number(r.quantity) > 0) || r.price === "" || !Number.isFinite(price) || (r.key && price < 0);
    });
    if (bad) throw new Error(t("quote.badLine"));
    if (total < 0) throw new Error(t("quote.negativeTotal"));
    return rows.map((r) => ({
      key: r.key,
      description: r.description.trim(),
      quantity: Number(r.quantity),
      unit_amount: Math.round(Number(r.price) * 100),
    }));
  };

  const save = async (andSend) => {
    if (andSend && !window.confirm(t("quote.sendConfirm"))) return;
    setBusy(andSend ? "send" : "save");
    setError(null);
    try {
      const { error: err } = await supabase.rpc("save_quote", { p_order: order.id, p_lines: payload() });
      if (err) throw err;
      if (andSend) {
        const { error: sendErr } = await supabase.rpc("send_quote", { p_order: order.id });
        if (sendErr) throw sendErr;
      }
      setDirty(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      {order.quote_status === "changes_requested" && order.quote_response && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 rounded-xl">
          {t("quote.clientAsked", { note: order.quote_response })}
        </div>
      )}
      {order.quote_sent_at && <p className="text-xs text-gray-400">{t("quote.sentOn", { date: fmtDate(order.quote_sent_at) })}</p>}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
              <th className="py-2 pr-2 font-semibold">{t("quote.description")}</th>
              <th className="py-2 pr-2 font-semibold text-right w-20">{t("quote.qty")}</th>
              <th className="py-2 pr-2 font-semibold text-right w-24">{t("quote.price")}</th>
              <th className="py-2 pr-2 font-semibold text-right w-24">{t("quote.total")}</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, n) => (
              <tr key={n} className="border-t border-gray-100">
                <td className="py-2 pr-2">
                  <input className={cellInput} value={r.description} onChange={(e) => setRow(n, "description", e.target.value)} />
                </td>
                <td className="py-2 pr-2">
                  <input type="number" min="0" step="any" inputMode="decimal" className={`${cellInput} text-right`} value={r.quantity} onChange={(e) => setRow(n, "quantity", e.target.value)} />
                </td>
                <td className="py-2 pr-2">
                  <input type="number" step="0.01" inputMode="decimal" className={`${cellInput} text-right`} value={r.price} onChange={(e) => setRow(n, "price", e.target.value)} />
                </td>
                <td className={`py-2 pr-2 text-right font-medium ${rowAmount(r) < 0 ? "text-green-700" : ""}`}>{fmtMoney(rowAmount(r))}</td>
                <td className="py-2 text-right">
                  <button type="button" onClick={() => edit((list) => list.filter((_, i) => i !== n))} className="text-gray-400 hover:text-red-600" aria-label={t("quote.remove")}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 font-bold text-primary">
              <td className="py-3" colSpan={3}>{t("quote.total")}</td>
              <td className="py-3 pr-2 text-right">{fmtMoney(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex flex-wrap gap-4 text-sm font-semibold">
        <button type="button" onClick={() => edit((list) => [...list, { key: null, description: "", quantity: "1", price: "" }])} className="text-third hover:underline">
          + {t("quote.addLine")}
        </button>
        <button type="button" onClick={() => edit((list) => [...list, { key: null, description: clientStrings.quote.discount, quantity: "1", price: "" }])} className="text-third hover:underline">
          + {t("quote.addDiscount")}
        </button>
        <button type="button" onClick={() => { setDirty(true); setRows(toRows(quoteDraftLines(order, labels))); }} className="text-gray-400 hover:text-third">
          {t("quote.reset")}
        </button>
      </div>
      <p className="text-xs text-gray-400">{t("quote.discountHint")}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => save(true)} disabled={!!busy} className={btnPrimary}>
          {busy === "send" ? t("common.saving") : order.quote_sent_at ? t("quote.resend") : t("quote.send")}
        </button>
        <button type="button" onClick={() => save(false)} disabled={!!busy || !dirty} className={btnSecondary}>
          {busy === "save" ? t("common.saving") : t("quote.save")}
        </button>
      </div>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

function ClientQuote({ order, onChanged }) {
  const { t, fmtDate } = useT();
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const respond = async (accept) => {
    if (accept && !window.confirm(t("quote.acceptConfirm"))) return;
    if (!accept && !note.trim()) return setError(t("quote.changesRequired"));
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("respond_quote", { p_order: order.id, p_accept: accept, p_note: accept ? null : note.trim() });
    setBusy(false);
    if (err) return setError(err.message);
    setAsking(false);
    onChanged();
  };

  return (
    <div className="space-y-4">
      {order.quote_status === "sent" && <p className="text-sm text-gray-600">{t("quote.clientHelp")}</p>}
      <LinesTable lines={sortedLines(order)} />
      {order.quote_status === "accepted" && <p className="text-sm text-green-700">{t("quote.clientAccepted", { date: fmtDate(order.quote_accepted_at) })}</p>}
      {order.quote_status === "changes_requested" && <p className="text-sm text-amber-800">{t("quote.clientChanges")}</p>}
      {order.quote_status === "sent" &&
        (asking ? (
          <div className="space-y-3">
            <textarea className={inputCls} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("quote.changesPlaceholder")} />
            <div className="flex gap-2">
              <button type="button" onClick={() => respond(false)} disabled={busy} className={btnPrimary}>{busy ? t("common.saving") : t("quote.sendChanges")}</button>
              <button type="button" onClick={() => setAsking(false)} className={btnSecondary}>{t("common.back")}</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => respond(true)} disabled={busy} className={btnPrimary}>{busy ? t("common.saving") : t("quote.accept")}</button>
            <button type="button" onClick={() => setAsking(true)} className={btnSecondary}>{t("quote.requestChanges")}</button>
          </div>
        ))}
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

const QuotePanel = ({ order, isStaff, onChanged }) =>
  isStaff ? <StaffQuote order={order} onChanged={onChanged} /> : <ClientQuote order={order} onChanged={onChanged} />;

export default QuotePanel;
