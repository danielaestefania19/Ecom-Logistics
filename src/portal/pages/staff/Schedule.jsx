import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { isoDay, orderCode, orderUnits, parseDay, setStage, subscribeToChanges, syncAsana } from "../../lib/orders";
import { btnSecondary, ErrorBanner, PageHeader, Spinner, StageBadge } from "../../components/ui";

const WORK_DAYS = 6; // Monday–Saturday, like the old "Prep Center Planificación semanal" sections.

const mondayOf = (date) => {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

function ScheduleCard({ order, onChanged }) {
  const { t } = useT();
  const [error, setError] = useState(null);

  const assign = async (day) => {
    setError(null);
    const { error: err } = await supabase.from("orders").update({ prep_day: day || null }).eq("id", order.id);
    if (err) return setError(err.message);
    try {
      if (day && order.stage === "received") await setStage(order.id, "scheduled");
      else syncAsana(order.id);
    } catch (e) {
      setError(e.message);
    }
    onChanged();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <div className="flex items-center justify-between gap-2">
        <Link to={`/portal/orders/${order.id}`} className="text-sm font-bold text-primary hover:text-third">{orderCode(order)}</Link>
        <span className="text-xs font-semibold text-gray-500">{t("orders.units", { n: orderUnits(order) })}</span>
      </div>
      <p className="text-xs text-gray-600 truncate">{order.clients?.company || order.clients?.email}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <StageBadge stage={order.stage} />
        <input
          type="date"
          aria-label={t("order.prepDay")}
          value={order.prep_day ?? ""}
          onChange={(e) => assign(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 w-[8.5rem]"
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const Schedule = () => {
  const { t, fmtDate } = useT();
  const [week, setWeek] = useState(() => mondayOf(new Date()));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = useMemo(() => Array.from({ length: WORK_DAYS }, (_, i) => isoDay(addDays(week, i))), [week]);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("orders")
      .select("id, order_number, stage, prep_day, clients(company, email), order_items(expected_qty)")
      .in("stage", ["received", "scheduled", "prepped"])
      .order("created_at");
    if (err) setError(err.message);
    else setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    return subscribeToChanges("ops-schedule", [{ table: "orders" }], load);
  }, [load]);

  const unscheduled = orders.filter((o) => !o.prep_day && o.stage !== "prepped");

  return (
    <div>
      <PageHeader
        title={t("schedule.title")}
        subtitle={t("schedule.subtitle")}
        action={
          <div className="flex items-center gap-2">
            <button className={btnSecondary} onClick={() => setWeek((w) => addDays(w, -7))} aria-label={t("schedule.prevWeek")}>←</button>
            <button className={btnSecondary} onClick={() => setWeek(mondayOf(new Date()))}>{t("schedule.thisWeek")}</button>
            <button className={btnSecondary} onClick={() => setWeek((w) => addDays(w, 7))} aria-label={t("schedule.nextWeek")}>→</button>
          </div>
        }
      />
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={load} />}
      {!loading && !error && (
        <div className="space-y-6">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              {t("schedule.toSchedule")} ({unscheduled.length})
            </h2>
            {unscheduled.length === 0 ? (
              <p className="text-sm text-gray-400">{t("schedule.nothingToSchedule")}</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {unscheduled.map((o) => <ScheduleCard key={o.id} order={o} onChanged={load} />)}
              </div>
            )}
          </section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {days.map((day) => {
              const list = orders.filter((o) => o.prep_day === day);
              const units = list.reduce((n, o) => n + orderUnits(o), 0);
              const isToday = day === isoDay(new Date());
              return (
                <section key={day} className={`rounded-2xl p-3 min-h-[140px] ${isToday ? "bg-third/10 ring-1 ring-third/30" : "bg-gray-100/70"}`}>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-sm font-bold text-primary capitalize">
                      {fmtDate(parseDay(day), { weekday: "short", month: "short", day: "numeric" })}
                    </h3>
                    <span className="text-xs text-gray-500">{t("orders.units", { n: units })}</span>
                  </div>
                  <div className="space-y-2">
                    {list.map((o) => <ScheduleCard key={o.id} order={o} onChanged={load} />)}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
