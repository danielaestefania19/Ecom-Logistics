import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../AuthContext";
import { useT } from "../../i18n";
import { invoiceLines } from "../../lib/estimate";
import { callFunction, nextStages, setStage, syncAsana } from "../../lib/orders";
import { STRINGS } from "../../strings";
import { btnPrimary, btnSecondary, ErrorBanner, Field, inputCls } from "../ui";

const STAGE_ORDER = ["received", "prepped", "in_storage", "shipped", "invoiced"];

export function StageActions({ order, onChanged }) {
  const { t } = useT();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const next = nextStages(order);

  const move = async (stage) => {
    setBusy(stage);
    setError(null);
    try {
      await setStage(order.id, stage, note.trim());
      setNote("");
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  if (!next.length) return <p className="text-sm text-gray-400">{t("staff.noNextStage")}</p>;

  return (
    <div className="space-y-3">
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
            disabled={!!busy}
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
    const patch = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]));
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
          <p className="text-xs text-gray-500">{t("staff.invoiceDraftHint", { total: fmtMoney(total) })}</p>
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
