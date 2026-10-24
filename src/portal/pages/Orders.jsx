import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { orderCode, orderUnits, subscribeToChanges } from "../lib/orders";
import { btnPrimary, ErrorBanner, PageHeader, Spinner, StageBadge, TrackingBadge } from "../components/ui";

const DONE = new Set(["paid", "cancelled"]);

function OrderRow({ order, showClient }) {
  const { t, fmtDate } = useT();
  const shipments = order.shipments_inbound ?? [];
  return (
    <Link
      to={`/portal/orders/${order.id}`}
      className="block bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-third/50 transition"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-primary font-semibold text-sm">
            {orderCode(order)}
            {showClient && <span className="text-gray-500 font-normal"> · {order.clients?.company || order.clients?.email}</span>}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {t("orders.units", { n: orderUnits(order) })} · {t("orders.createdOn", { date: fmtDate(order.created_at) })}
            {order.eta && ` · ${t("order.eta")}: ${fmtDate(`${order.eta}T12:00:00`)}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {shipments.slice(0, 2).map((s) => (
            <TrackingBadge key={s.tracking_number} status={s.status} />
          ))}
          <StageBadge stage={order.stage} />
        </div>
      </div>
    </Link>
  );
}

const Orders = () => {
  const { t } = useT();
  const { role } = useAuth();
  const isStaff = role === "staff" || role === "admin";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("active");

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("orders")
      .select("id, order_number, stage, eta, created_at, clients(company, email), order_items(expected_qty), shipments_inbound(tracking_number, status)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (err) setError(err.message);
    else setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    return subscribeToChanges("orders-list", [{ table: "orders" }, { table: "shipments_inbound" }], load);
  }, [load]);

  const active = orders.filter((o) => !DONE.has(o.stage));
  const done = orders.filter((o) => DONE.has(o.stage));
  const shown = tab === "active" ? active : done;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={isStaff ? t("orders.allTitle") : t("orders.title")}
        subtitle={t("orders.subtitle")}
        action={<Link to="/portal/orders/new" className={btnPrimary}>+ {t("orders.new")}</Link>}
      />

      <div className="flex gap-2 mb-4">
        {[["active", active.length], ["done", done.length]].map(([key, n]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition ${tab === key ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            {t(`orders.tab.${key}`)} ({n})
          </button>
        ))}
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorBanner message={error} onRetry={load} />}
      {!loading && !error && shown.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-14 text-center">
          <p className="text-primary font-semibold mb-1">{t(tab === "active" ? "orders.emptyActive" : "orders.emptyDone")}</p>
          {tab === "active" && (
            <>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">{t("orders.emptyHint")}</p>
              <Link to="/portal/orders/new" className={`${btnPrimary} mt-5`}>{t("orders.new")}</Link>
            </>
          )}
        </div>
      )}
      {!loading && !error && shown.length > 0 && (
        <div className="space-y-3">
          {shown.map((o) => (
            <OrderRow key={o.id} order={o} showClient={isStaff} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
