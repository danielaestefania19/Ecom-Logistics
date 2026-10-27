import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { isoDay, orderCode, registerTracking, subscribeToChanges } from "../../lib/orders";
import { ErrorBanner, PageHeader, Spinner, TrackingBadge } from "../../components/ui";

const GROUPS = ["overdue", "today", "week", "later", "noEta", "deliveredToday"];

function groupOf(s, today, weekEnd) {
  if (s.status === "delivered") return s.delivered_at && isoDay(s.delivered_at) === today ? "deliveredToday" : null;
  const eta = s.eta || s.orders?.eta;
  if (!eta) return "noEta";
  if (eta < today) return "overdue";
  if (eta === today) return "today";
  if (eta <= weekEnd) return "week";
  return "later";
}

const Arrivals = () => {
  const { t, fmtDate } = useT();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { data, error: err } = await supabase
      .from("shipments_inbound")
      .select("id, tracking_number, carrier, status, eta, delivered_at, last_event, provider_tracker_id, orders!inner(id, order_number, stage, eta, clients(company, email))")
      .or(`status.neq.delivered,delivered_at.gte.${since.toISOString()}`)
      .neq("status", "cancelled")
      .in("orders.stage", ["quote", "awaiting_inventory", "received", "discrepancy"]);
    if (err) setError(err.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    return subscribeToChanges("ops-arrivals", [{ table: "shipments_inbound" }], load);
  }, [load]);

  // Connect any tracking that missed live updates (added while EasyPost was unavailable), once per visit.
  const [swept, setSwept] = useState(false);
  useEffect(() => {
    if (swept || loading) return;
    setSwept(true);
    const orders = new Set(rows.filter((r) => !r.provider_tracker_id).map((r) => r.orders.id));
    orders.forEach((id) => registerTracking(id));
  }, [swept, loading, rows]);

  const today = isoDay(new Date());
  const weekEnd = isoDay(new Date(Date.now() + 6 * 864e5));
  const grouped = Object.fromEntries(GROUPS.map((g) => [g, []]));
  for (const r of rows) {
    const g = groupOf(r, today, weekEnd);
    if (g) grouped[g].push(r);
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title={t("arrivals.title")} subtitle={t("arrivals.subtitle")} />
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={load} />}
      {!loading && !error && rows.length === 0 && <p className="text-sm text-gray-400">{t("arrivals.empty")}</p>}
      {!loading && !error && (
        <div className="space-y-6">
          {GROUPS.filter((g) => grouped[g].length).map((g) => (
            <section key={g}>
              <h2 className={`text-xs font-bold uppercase tracking-wide mb-2 ${g === "overdue" ? "text-red-600" : "text-gray-500"}`}>
                {t(`arrivals.group.${g}`)} ({grouped[g].length})
              </h2>
              <div className="space-y-2">
                {grouped[g].map((s) => (
                  <Link
                    key={s.id}
                    to={`/portal/orders/${s.orders.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-third/50 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary">
                        {orderCode(s.orders)} · <span className="font-normal text-gray-600">{s.orders.clients?.company || s.orders.clients?.email}</span>
                      </p>
                      <p className="text-xs text-gray-400 font-mono break-all">
                        {s.tracking_number}
                        {s.carrier && <span className="font-sans"> · {s.carrier}</span>}
                      </p>
                      {s.last_event && <p className="text-xs text-gray-600 mt-0.5">{s.last_event}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {(s.eta || s.orders.eta) && s.status !== "delivered" && (
                        <span className="text-xs text-gray-500">{fmtDate(`${s.eta || s.orders.eta}T12:00:00`, { month: "short", day: "numeric" })}</span>
                      )}
                      <TrackingBadge status={s.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Arrivals;
