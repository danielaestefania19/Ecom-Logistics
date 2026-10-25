import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { BOARD_STAGES, nextStages, orderCode, orderUnits, setStage, subscribeToChanges } from "../../lib/orders";
import { btnPrimary, ErrorBanner, inputCls, PageHeader, Spinner, TrackingBadge } from "../../components/ui";

function BoardCard({ order, onMoved }) {
  const { t, fmtDate } = useT();
  const [busy, setBusy] = useState(false);
  const next = nextStages(order).find((s) => s !== "cancelled" && s !== "quote");
  const shipments = order.shipments_inbound ?? [];
  const day = (d) => fmtDate(`${d}T12:00:00`, { month: "short", day: "numeric" });

  const advance = async () => {
    setBusy(true);
    try {
      await setStage(order.id, next);
      onMoved();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 hover:border-third/50 transition">
      <Link to={`/portal/orders/${order.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-primary">
            {orderCode(order)}
            {order.type === "3pl" && <span className="ml-1.5 text-[10px] font-bold text-third bg-third/10 px-1.5 py-0.5 rounded">3PL</span>}
          </p>
          <span className="text-xs font-semibold text-gray-500">{t("orders.units", { n: orderUnits(order) })}</span>
        </div>
        <p className="text-xs text-gray-600 truncate mt-0.5">{order.clients?.company || order.clients?.email}</p>
      </Link>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {order.eta && order.stage === "awaiting_inventory" && (
          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t("order.eta")} {day(order.eta)}</span>
        )}
        {order.prep_day && (
          <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{t("board.prep")} {day(order.prep_day)}</span>
        )}
        {order.stage === "awaiting_inventory" && shipments.map((s) => <TrackingBadge key={s.id} status={s.status} />)}
      </div>
      {next && (
        <button onClick={advance} disabled={busy} className="mt-3 w-full text-xs font-semibold text-third border border-third/30 rounded-lg py-2 hover:bg-third/5 disabled:opacity-50">
          {busy ? "…" : `→ ${order.type === "3pl" && next === "in_storage" ? t("staff.addToInventory") : t(`stage.${next}`)}`}
        </button>
      )}
    </div>
  );
}

const Board = () => {
  const { t } = useT();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("orders")
      .select("id, order_number, type, stage, eta, prep_day, created_at, clients(company, email), order_items(expected_qty), shipments_inbound(id, status)")
      .in("stage", BOARD_STAGES)
      .order("created_at", { ascending: true });
    if (err) setError(err.message);
    else setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    return subscribeToChanges("ops-board", [{ table: "orders" }, { table: "shipments_inbound" }], load);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) => String(o.order_number).includes(q.replace("#", "")) || (o.clients?.company ?? "").toLowerCase().includes(q) || (o.clients?.email ?? "").toLowerCase().includes(q)
    );
  }, [orders, query]);

  return (
    <div>
      <PageHeader
        title={t("board.title")}
        subtitle={t("board.subtitle")}
        action={<Link to="/portal/orders/new" className={btnPrimary}>+ {t("orders.new")}</Link>}
      />
      <div className="mb-4 max-w-sm">
        <input className={inputCls} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("board.search")} />
      </div>
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={load} />}
      {!loading && !error && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x">
          {BOARD_STAGES.map((stage) => {
            const col = filtered.filter((o) => o.stage === stage);
            return (
              <section key={stage} className="w-64 flex-shrink-0 snap-start">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">{t(`stage.${stage}`)}</h2>
                  <span className="text-xs font-semibold text-gray-400">{col.length}</span>
                </div>
                <div className="space-y-2 bg-gray-100/70 rounded-2xl p-2 min-h-[120px]">
                  {col.map((o) => (
                    <BoardCard key={o.id} order={o} onMoved={load} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Board;
