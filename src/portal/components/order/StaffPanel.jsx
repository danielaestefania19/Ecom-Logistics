import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../AuthContext";
import { useT } from "../../i18n";
import { invoiceLines } from "../../lib/estimate";
import { callFunction, isoDay, nextStages, parseDay, setStage, syncAsana } from "../../lib/orders";
import { STRINGS } from "../../strings";
import { labelsAfterPacking } from "./PackingListPanel";
import { btnPrimary, btnSecondary, ErrorBanner, Field, inputCls } from "../ui";

const STAGE_ORDER = ["received", "prepped", "in_storage", "shipped", "invoiced"];

// The stage an order was in before its current one, skipping earlier undos, so a mistaken move
// (e.g. marked paid too soon) can be taken back one step at a time.
function previousStage(order) {
  const last = [...(order.order_events ?? [])]
    .filter((e) => e.to_stage === order.stage && e.from_stage && e.note !== "stage_reverted")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  // 3PL units already posted to stock can't be pulled back by a stage change.
  if (!last || (order.type === "3pl" && order.stage === "in_storage")) return null;
  return last.from_stage;
}

// Leaving receiving for real work (prep, stock) is when the receiving date has to be right.
const RECEIVING = new Set(["received", "discrepancy"]);
const asksReceivedDate = (order, stage) =>
  RECEIVING.has(order.stage) && !RECEIVING.has(stage) && !["cancelled", "awaiting_inventory"].includes(stage);
// Noon local time, so the stored timestamp lands on the same calendar day everywhere.
const dayToTimestamp = (day) => new Date(`${day}T12:00:00`).toISOString();

function ReceivedDateConfirm({ order, stage, busy, onConfirm, onCancel }) {
  const { t, fmtDate } = useT();
  const today = isoDay(new Date());
  const [day, setDay] = useState(order.received_at ? isoDay(order.received_at) : today);
  const matches = order.eta && day === order.eta;
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-sm font-bold text-primary">{t("staff.receivedDateTitle")}</p>
        <p className="text-xs text-gray-600">{t("staff.receivedDateHelp")}</p>
      </div>
      <input type="date" className={inputCls} value={day} max={today} onChange={(e) => setDay(e.target.value)} />
      {order.eta ? (
        <p className={`text-sm ${matches ? "text-green-700" : "text-amber-700"}`}>
          {matches ? t("staff.receivedDateMatches") : t("staff.receivedDateMismatch", { date: fmtDate(parseDay(order.eta)) })}
        </p>
      ) : (
        <p className="text-xs text-gray-500">{t("staff.receivedDateNoEta")}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onConfirm(day)} disabled={!day || !!busy} className={btnPrimary}>
          {busy ? t("common.saving") : t("staff.confirmMove", { stage: t(`stage.${stage}`) })}
        </button>
        <button type="button" onClick={onCancel} disabled={!!busy} className={btnSecondary}>{t("common.cancel")}</button>
      </div>
    </div>
  );
}

export function StageActions({ order, onChanged }) {
  const { t } = useT();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const next = nextStages(order);
  const previous = previousStage(order);
  // When the client creates the Amazon shipment, it can't leave until their labels are in.
  const awaitingLabels =
    order.shipment_creator === "customer" && !!order.packing_sent_at && labelsAfterPacking(order).length === 0;

  const move = async (stage, reverting = false, receivedDay = null) => {
    if (reverting && !window.confirm(t("staff.revertConfirm", { stage: t(`stage.${stage}`) }))) return;
    // Cancellations are only recorded with a reason (the database enforces it too).
    if (stage === "cancelled" && !note.trim()) return setError(t("staff.cancelReasonRequired"));
    if (!reverting && !receivedDay && asksReceivedDate(order, stage)) return setConfirming(stage);
    setBusy(stage);
    setError(null);
    try {
      if (receivedDay && receivedDay !== (order.received_at && isoDay(order.received_at))) {
        const { error: err } = await supabase.from("orders").update({ received_at: dayToTimestamp(receivedDay) }).eq("id", order.id);
        if (err) throw err;
      }
      await setStage(order.id, stage, reverting ? "stage_reverted" : note.trim());
      setNote("");
      setConfirming(null);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  if (confirming) {
    return (
      <div className="space-y-3">
        <ReceivedDateConfirm
          order={order}
          stage={confirming}
          busy={busy}
          onConfirm={(day) => move(confirming, false, day)}
          onCancel={() => setConfirming(null)}
        />
        {error && <ErrorBanner message={error} />}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {next.length > 0 ? (
        <>
          <textarea
            className={inputCls}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("staff.stageNotePlaceholder")}
          />
          <div className="flex flex-wrap gap-2">
            {next.map((stage, i) => (
              <button
                key={stage}
                type="button"
                onClick={() => move(stage)}
                disabled={!!busy || (stage === "shipped" && awaitingLabels)}
                title={stage === "shipped" && awaitingLabels ? t("packing.waitingLabels") : undefined}
                className={i === 0 && stage !== "cancelled" ? btnPrimary : btnSecondary}
              >
                {busy === stage
                  ? t("common.saving")
                  : order.type === "3pl" && stage === "in_storage"
                    ? `→ ${t("staff.addToInventory")}`
                    : `→ ${t(`stage.${stage}`)}`}
              </button>
            ))}
          </div>
          {awaitingLabels && next.includes("shipped") && <p className="text-xs text-amber-700">{t("packing.waitingLabels")}</p>}
        </>
      ) : (
        <p className="text-sm text-gray-400">{t("staff.noNextStage")}</p>
      )}
      {previous && (
        <button
          type="button"
          onClick={() => move(previous, true)}
          disabled={!!busy}
          className="text-xs font-semibold text-gray-500 hover:text-third underline"
        >
          {busy === previous ? t("common.saving") : t("staff.revertTo", { stage: t(`stage.${previous}`) })}
        </button>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

export function Checklist({ items, onChanged }) {
  const { t } = useT();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const toggle = async (item) => {
    setError(null);
    const done = !item.done;
    const { error: err } = await supabase
      .from("order_checklist")
      .update({ done, done_by: done ? user.id : null, done_at: done ? new Date().toISOString() : null })
      .eq("id", item.id);
    if (err) setError(err.message);
    onChanged();
  };

  return (
    <div className="space-y-4">
      {STAGE_ORDER.map((stage) => {
        const group = items.filter((i) => i.stage === stage).sort((a, b) => a.position - b.position);
        if (!group.length) return null;
        return (
          <div key={stage}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">{t(`stage.${stage}`)}</p>
            <ul className="space-y-1">
              {group.map((item) => (
                <li key={item.id}>
                  <label className="flex items-center gap-3 py-1.5 text-sm cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-third" checked={item.done} onChange={() => toggle(item)} />
                    <span className={item.done ? "text-gray-400 line-through" : "text-gray-700"}>{t(`checklist.${item.item_key}`)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

const pick = (order) => ({
  received_day: order.received_at ? isoDay(order.received_at) : "",
  prep_day: order.prep_day ?? "",
  quote_url: order.quote_url ?? "",
  invoice_number: order.invoice_number ?? "",
  stripe_invoice_id: order.stripe_invoice_id ?? "",
});

export function OrderAdminFields({ order, onChanged }) {
  const { t } = useT();
  const [form, setForm] = useState(() => pick(order));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(pick(order)), [order]);

  const set = (k, v) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { received_day: receivedDay, ...fields } = form;
    const patch = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]));
    // Only rewrite the timestamp when the day itself was corrected.
    if (receivedDay && receivedDay !== pick(order).received_day) patch.received_at = dayToTimestamp(receivedDay);
    const { error: err } = await supabase.from("orders").update(patch).eq("id", order.id);
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    // Giving a received order a prep day is what "scheduling" means on the floor.
    if (patch.prep_day && order.stage === "received") {
      try {
        await setStage(order.id, "scheduled");
      } catch (e2) {
        setError(e2.message);
      }
    } else {
      syncAsana(order.id);
    }
    setBusy(false);
    setSaved(true);
    onChanged();
  };

  return (
    <form onSubmit={save} className="space-y-4">
      {order.received_at && (
        <Field label={t("order.receivedAt")}>
          <input type="date" className={inputCls} value={form.received_day} max={isoDay(new Date())} onChange={(e) => set("received_day", e.target.value)} />
        </Field>
      )}
      {order.type !== "3pl" && (
        <Field label={t("order.prepDay")}>
          <input type="date" className={inputCls} value={form.prep_day} onChange={(e) => set("prep_day", e.target.value)} />
        </Field>
      )}
      <Field label={t("order.quoteUrl")}>
        <input className={inputCls} value={form.quote_url} onChange={(e) => set("quote_url", e.target.value)} placeholder="https://invoice.stripe.com/…" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("order.invoiceNumber")}>
          <input className={inputCls} value={form.invoice_number} onChange={(e) => set("invoice_number", e.target.value)} />
        </Field>
        <Field label={t("order.stripeInvoiceId")}>
          <input className={inputCls} value={form.stripe_invoice_id} onChange={(e) => set("stripe_invoice_id", e.target.value)} placeholder="in_…" />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={btnSecondary}>{busy ? t("common.saving") : t("common.save")}</button>
        {saved && <span className="text-sm text-green-600">{t("common.saved")}</span>}
      </div>
      {error && <ErrorBanner message={error} />}
    </form>
  );
}

const stripeInvoiceUrl = (id) => `https://dashboard.stripe.com/invoices/${id}`;

// Drafts the order's invoice in Stripe; finalizing and payment then come back through the webhook.
export function StripeInvoice({ order, onChanged }) {
  const { t, fmtMoney, fmtDate } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [draftUrl, setDraftUrl] = useState(null);

  const labels = STRINGS[order.clients?.language === "es" ? "es" : "en"].estimate.line;
  const lines = useMemo(() => invoiceLines(order, labels), [order, labels]);
  const total = lines.reduce((n, l) => n + l.quantity * l.unit_amount, 0) / 100;

  const createDraft = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await callFunction("stripe-billing", { action: "create_invoice_draft", order_id: order.id, lines });
      setDraftUrl(res.dashboard_url);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
      {order.invoice_paid_at && (
        <p className="text-sm font-semibold text-green-700">✓ {t("staff.invoicePaid", { date: fmtDate(order.invoice_paid_at) })}</p>
      )}
      {order.stripe_invoice_id ? (
        <>
          {draftUrl && <p className="text-sm text-green-700">{t("staff.invoiceDraftDone")}</p>}
          <a
            href={draftUrl ?? stripeInvoiceUrl(order.stripe_invoice_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold text-third hover:underline"
          >
            {t("staff.openInStripe")} ↗
          </a>
        </>
      ) : lines.length ? (
        <>
          <p className="text-xs text-gray-500">
            {t(order.quote_status === "accepted" ? "staff.invoiceDraftHintQuote" : "staff.invoiceDraftHint", { total: fmtMoney(total) })}
          </p>
          <button type="button" onClick={createDraft} disabled={busy} className={btnPrimary}>
            {busy ? t("common.saving") : t("staff.invoiceDraft")}
          </button>
        </>
      ) : (
        <p className="text-xs text-gray-400">{t("staff.invoiceDraftEmpty")}</p>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

export function NoteForm({ orderId, onChanged }) {
  const { t } = useT();
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase
      .from("order_events")
      .insert({ order_id: orderId, note: text.trim(), visible_to_client: visible });
    setBusy(false);
    if (err) return setError(err.message);
    setText("");
    onChanged();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea className={inputCls} rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("staff.notePlaceholder")} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" className="accent-third" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          {t("staff.visibleToClient")}
        </label>
        <button type="submit" disabled={busy || !text.trim()} className={btnSecondary}>{t("staff.addNote")}</button>
      </div>
      {error && <ErrorBanner message={error} />}
    </form>
  );
}
