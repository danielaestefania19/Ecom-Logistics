import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { PACKAGING } from "../lib/estimate";
import {
  fulfillmentCode,
  NEXT_FULFILLMENT,
  OPEN_FULFILLMENT,
  openOrderFile,
  setFulfillmentStatus,
  subscribeToChanges,
  uploadFulfillmentFile,
} from "../lib/orders";
import { btnPrimary, btnSecondary, Card, ErrorBanner, Field, FulfillmentBadge, inputCls, PageHeader, Spinner } from "../components/ui";

const NOTE_KEYS = new Set(["order_created", "insufficient_stock"]);

function StatusActions({ f, onChanged }) {
  const { t } = useT();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const next = NEXT_FULFILLMENT[f.status] ?? [];
  if (!next.length) return <p className="text-sm text-gray-400">{t("staff.noNextStage")}</p>;

  const move = async (status) => {
    setBusy(status);
    setError(null);
    try {
      await setFulfillmentStatus(f.id, status, note.trim());
      setNote("");
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("staff.stageNotePlaceholder")} />
      <div className="flex flex-wrap gap-2">
        {next.map((s, i) => (
          <button key={s} type="button" onClick={() => move(s)} disabled={!!busy} className={i === 0 && s !== "cancelled" ? btnPrimary : btnSecondary}>
            {busy === s ? t("common.saving") : `→ ${t(`fulfillment.status.${s}`)}`}
          </button>
        ))}
      </div>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

const pickShipping = (f) => ({
  carrier: f.carrier ?? "",
  tracking_number: f.tracking_number ?? "",
  packaging: f.packaging,
  notes: f.notes ?? "",
});

function ShippingFields({ f, onChanged }) {
  const { t } = useT();
  const [form, setForm] = useState(() => pickShipping(f));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => setForm(pickShipping(f)), [f]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase
      .from("fulfillment_orders")
      .update({
        carrier: form.carrier.trim() || null,
        tracking_number: form.tracking_number.trim().toUpperCase() || null,
        packaging: form.packaging,
        notes: form.notes.trim() || null,
      })
      .eq("id", f.id);
    setBusy(false);
    if (err) return setError(err.message);
    setSaved(true);
    onChanged();
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("fulfillment.carrier")}>
          <input className={inputCls} value={form.carrier} onChange={(e) => setForm((x) => ({ ...x, carrier: e.target.value }))} />
        </Field>
        <Field label={t("fulfillment.packaging")}>
          <select className={inputCls} value={form.packaging} onChange={(e) => setForm((x) => ({ ...x, packaging: e.target.value }))}>
            {PACKAGING.map((p) => <option key={p} value={p}>{t(`packaging.${p}`)}</option>)}
          </select>
        </Field>
      </div>
      <Field label={t("fulfillment.tracking")}>
        <input className={inputCls} value={form.tracking_number} onChange={(e) => setForm((x) => ({ ...x, tracking_number: e.target.value }))} />
      </Field>
      <Field label={t("order.notes")}>
        <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => setForm((x) => ({ ...x, notes: e.target.value }))} />
      </Field>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={btnSecondary}>{busy ? t("common.saving") : t("common.save")}</button>
        {saved && <span className="text-sm text-green-600">{t("common.saved")}</span>}
      </div>
      {error && <ErrorBanner message={error} />}
    </form>
  );
}

function LabelFiles({ f, canUpload, onChanged }) {
  const { t, fmtDateTime } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const files = [...(f.fulfillment_files ?? [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const upload = async (e) => {
    const list = [...e.target.files];
    e.target.value = "";
    if (!list.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of list) await uploadFulfillmentFile(f.id, file, "label");
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const open = async (path) => {
    try {
      await openOrderFile(path);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-3">
      {files.length === 0 && canUpload && <p className="text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2">{t("fulfillment.labelMissing")}</p>}
      {files.length === 0 && !canUpload && <p className="text-sm text-gray-400">{t("files.none")}</p>}
      <ul className="divide-y divide-gray-100">
        {files.map((file) => (
          <li key={file.id} className="py-2 flex items-center justify-between gap-3">
            <button type="button" onClick={() => open(file.storage_path)} className="text-sm text-third font-medium truncate text-left hover:underline">
              {file.file_name}
            </button>
            <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDateTime(file.created_at)}</span>
          </li>
        ))}
      </ul>
      {canUpload && (
        <label className={`inline-block cursor-pointer text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:border-third hover:text-third transition ${busy ? "opacity-50 pointer-events-none" : ""}`}>
          {busy ? t("files.uploading") : t("fulfillment.uploadLabel")}
          <input type="file" multiple className="sr-only" accept="application/pdf,image/*" onChange={upload} />
        </label>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

const FulfillmentDetail = () => {
  const { id } = useParams();
  const { t, fmtDate, fmtDateTime } = useT();
  const { user, role } = useAuth();
  const isStaff = role === "staff" || role === "admin";

  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("fulfillment_orders")
      .select(`*, clients(company, full_name, email),
               fulfillment_lines(id, qty, products(sku, name, location, fragile)),
               fulfillment_files(*), fulfillment_events(*)`)
      .eq("id", id)
      .maybeSingle();
    if (err) setError(err.message);
    else if (!data) setError(t("orderDetail.notFound"));
    else {
      data.fulfillment_events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setF(data);
    }
    setLoading(false);
  }, [id, t]);

  useEffect(() => {
    load();
    return subscribeToChanges(`fulfillment-${id}`, [{ table: "fulfillment_orders", filter: `id=eq.${id}` }], load);
  }, [id, load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  const open = OPEN_FULFILLMENT.includes(f.status);
  const units = f.fulfillment_lines.reduce((n, l) => n + l.qty, 0);

  return (
    <div className="max-w-6xl">
      <Link to="/portal/fulfillment" className="text-sm text-gray-400 hover:text-third">← {t("common.back")}</Link>
      <div className="mt-2">
        <PageHeader
          title={`${t("fulfillment.order")} ${fulfillmentCode(f)}`}
          subtitle={[isStaff && (f.clients?.company || f.clients?.email), `${t(`channel.${f.channel}`)}${f.external_ref ? ` ${f.external_ref}` : ""}`, fmtDate(f.created_at)].filter(Boolean).join(" · ")}
          action={<FulfillmentBadge status={f.status} />}
        />
      </div>

      {f.status === "on_hold" && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl">{t("fulfillment.onHoldBanner")}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {isStaff && open && (
            <Card title={t("fulfillment.moveStatus")}>
              <StatusActions f={f} onChanged={load} />
            </Card>
          )}
          <Card title={t("fulfillment.productsCount", { n: units })}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
                  <th className="py-2 pr-3 font-semibold">{t("item.sku")}</th>
                  {isStaff && <th className="py-2 pr-3 font-semibold">{t("inventory.location")}</th>}
                  <th className="py-2 font-semibold text-right">{t("item.units")}</th>
                </tr>
              </thead>
              <tbody>
                {f.fulfillment_lines.map((l) => (
                  <tr key={l.id} className="border-t border-gray-100">
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-primary">{l.products?.sku}</p>
                      <p className="text-xs text-gray-400">{[l.products?.name, l.products?.fragile && t("inventory.fragile")].filter(Boolean).join(" · ")}</p>
                    </td>
                    {isStaff && <td className="py-3 pr-3 text-gray-600 font-mono">{l.products?.location || "—"}</td>}
                    <td className="py-3 text-right text-lg font-bold">{l.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title={t("orderDetail.timeline")}>
            <ol className="space-y-3">
              {f.fulfillment_events.map((ev) => (
                <li key={ev.id} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {ev.to_status && <FulfillmentBadge status={ev.to_status} />}
                    <span className="text-xs text-gray-400">
                      {fmtDateTime(ev.created_at)} · {ev.actor_id === user?.id ? t("timeline.you") : t("timeline.team")}
                    </span>
                  </div>
                  {ev.note && <p className="text-gray-700 mt-1">{NOTE_KEYS.has(ev.note) ? t(`fulfillment.notes.${ev.note}`) : ev.note}</p>}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t("fulfillment.shipTo")}>
            <p className="text-sm font-semibold text-primary">{f.recipient_name}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{f.ship_to || "—"}</p>
            <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t("fulfillment.packaging")}</dt>
                <dd className="text-primary mt-0.5">{t(`packaging.${f.packaging}`)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t("fulfillment.tracking")}</dt>
                <dd className="text-primary mt-0.5 font-mono break-all">{f.tracking_number || "—"}{f.carrier && <span className="font-sans text-gray-500"> · {f.carrier}</span>}</dd>
              </div>
              {f.shipped_at && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t("fulfillment.status.shipped")}</dt>
                  <dd className="text-primary mt-0.5">{fmtDateTime(f.shipped_at)}</dd>
                </div>
              )}
            </dl>
          </Card>
          <Card title={t("fulfillment.label")}>
            <LabelFiles f={f} canUpload={open} onChanged={load} />
          </Card>
          {isStaff && open && (
            <Card title={t("fulfillment.shippingDetails")}>
              <ShippingFields f={f} onChanged={load} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FulfillmentDetail;
