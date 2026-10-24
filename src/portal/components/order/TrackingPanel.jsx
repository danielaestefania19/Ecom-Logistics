import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { registerTracking, setStage } from "../../lib/orders";
import { btnSecondary, ErrorBanner, inputCls, TrackingBadge } from "../ui";

const MANUAL_STATUSES = ["unknown", "pre_transit", "in_transit", "out_for_delivery", "delivered", "failure"];

const TrackingPanel = ({ order, shipments, canAdd, isStaff, onChanged }) => {
  const { t, fmtDate, fmtDateTime } = useT();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);

  const add = async (e) => {
    e.preventDefault();
    const tracking = code.trim().toUpperCase();
    if (!tracking) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("shipments_inbound").insert({ order_id: order.id, tracking_number: tracking });
    setBusy(false);
    if (err) return setError(err.code === "23505" ? t("tracking.duplicate") : err.message);
    setCode("");
    registerTracking(order.id).then(onChanged);
    onChanged();
  };

  // Manual fallback while no tracking provider is configured or the carrier isn't supported.
  const setManualStatus = async (shipment, status) => {
    setError(null);
    const { error: err } = await supabase
      .from("shipments_inbound")
      .update({ status, delivered_at: status === "delivered" ? new Date().toISOString() : null })
      .eq("id", shipment.id);
    if (err) return setError(err.message);
    const allDelivered = shipments.every((s) => (s.id === shipment.id ? status : s.status) === "delivered");
    if (allDelivered && order.stage === "awaiting_inventory") {
      try {
        await setStage(order.id, "received", "carrier_delivered");
      } catch (e) {
        setError(e.message);
      }
    }
    onChanged();
  };

  return (
    <div className="space-y-3">
      {shipments.length === 0 && <p className="text-sm text-gray-400">{t("tracking.none")}</p>}

      {shipments.map((s) => {
        const events = [...(s.tracking_events ?? [])].sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at));
        return (
          <div key={s.id} className="border border-gray-100 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-primary break-all">{s.tracking_number}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {[s.carrier, s.eta && `${t("tracking.eta")}: ${fmtDate(`${s.eta}T12:00:00`)}`, s.delivered_at && `${t("tracking.deliveredAt")}: ${fmtDateTime(s.delivered_at)}`]
                    .filter(Boolean)
                    .join(" · ") || t("tracking.waitingCarrier")}
                </p>
                {s.last_event && <p className="text-xs text-gray-600 mt-1">{s.last_event}</p>}
              </div>
              <div className="flex items-center gap-2">
                <TrackingBadge status={s.status} />
                {isStaff && !s.provider_tracker_id && (
                  <select
                    aria-label={t("tracking.manualStatus")}
                    value={s.status}
                    onChange={(e) => setManualStatus(s, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                  >
                    {MANUAL_STATUSES.map((st) => (
                      <option key={st} value={st}>{t(`tracking.status.${st}`)}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            {events.length > 0 && (
              <>
                <button type="button" onClick={() => setOpen(open === s.id ? null : s.id)} className="text-xs text-third font-semibold mt-2">
                  {open === s.id ? t("tracking.hideHistory") : t("tracking.showHistory", { n: events.length })}
                </button>
                {open === s.id && (
                  <ul className="mt-2 space-y-1.5">
                    {events.map((ev) => (
                      <li key={ev.id} className="text-xs text-gray-600">
                        <span className="text-gray-400">{fmtDateTime(ev.occurred_at)}</span> · {ev.message}
                        {ev.location && <span className="text-gray-400"> — {ev.location}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        );
      })}

      {canAdd && (
        <form onSubmit={add} className="flex gap-2">
          <input className={inputCls} value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("tracking.addPlaceholder")} />
          <button type="submit" disabled={busy || !code.trim()} className={btnSecondary}>
            {t("tracking.add")}
          </button>
        </form>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
};

export default TrackingPanel;
