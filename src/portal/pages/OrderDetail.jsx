import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { CLIENT_STEPS, orderCode, subscribeToChanges } from "../lib/orders";

const CLIENT_STEPS_3PL = ["awaiting_inventory", "received", "in_storage", "paid"];
const PROGRESS_INDEX_3PL = { awaiting_inventory: 0, received: 1, discrepancy: 1, in_storage: 2, invoiced: 2, paid: 3 };
import { Card, ErrorBanner, PageHeader, Spinner, StageBadge } from "../components/ui";
import Timeline from "../components/order/Timeline";
import ItemsTable from "../components/order/ItemsTable";
import TrackingPanel from "../components/order/TrackingPanel";
import FilesPanel from "../components/order/FilesPanel";
import { Checklist, NoteForm, OrderAdminFields, StageActions, StripeInvoice } from "../components/order/StaffPanel";
import ScanPanel from "../components/order/ScanPanel";
import { scanModeFor } from "../lib/scan";

const PROGRESS_INDEX = {
  awaiting_inventory: 0,
  received: 1,
  discrepancy: 1,
  scheduled: 2,
  prepped: 3,
  in_storage: 3,
  shipped: 4,
  invoiced: 4,
  paid: 5,
};

const RECEIVING_STAGES = new Set(["awaiting_inventory", "received", "discrepancy"]);
const CLOSED_STAGES = new Set(["paid", "cancelled"]);

function Progress({ order }) {
  const { t } = useT();
  const is3pl = order.type === "3pl";
  const steps = is3pl ? CLIENT_STEPS_3PL : CLIENT_STEPS;
  const idx = (is3pl ? PROGRESS_INDEX_3PL : PROGRESS_INDEX)[order.stage];
  if (idx == null) return null;
  return (
    <ol className={`grid gap-1 mb-6 ${is3pl ? "grid-cols-4" : "grid-cols-6"}`}>
      {steps.map((step, i) => (
        <li key={step} className="min-w-0">
          <div className={`h-1.5 rounded-full ${i <= idx ? "bg-third" : "bg-gray-200"}`} />
          <p className={`text-[10px] sm:text-xs mt-1.5 truncate ${i === idx ? "text-primary font-semibold" : "text-gray-400"}`}>
            {is3pl && step === "in_storage" ? t("stage.in_inventory") : t(`stage.${step}`)}
          </p>
        </li>
      ))}
    </ol>
  );
}

// How much of the order has been counted in, so the client sees partial arrivals at a glance.
function ReceivedBar({ items }) {
  const { t } = useT();
  if (!items.some((i) => i.received_qty != null)) return null;
  const expected = items.reduce((n, i) => n + i.expected_qty, 0);
  const received = items.reduce((n, i) => n + (i.received_qty ?? 0), 0);
  const pct = expected ? Math.round((received / expected) * 100) : 0;
  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-2xl px-5 py-4">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-primary">{t("order.receivedProgress")}</span>
        <span className="text-gray-600">{t("order.receivedOf", { n: received, of: expected, pct })}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${pct >= 100 ? "bg-green-600" : "bg-third"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

function Summary({ order }) {
  const { t, fmtDate, fmtMoney } = useT();
  const day = (d) => (d ? fmtDate(`${d}T12:00:00`) : "—");
  const prep = order.type !== "3pl";
  const rows = [
    [t("order.type"), t(`newOrder.type.${order.type}`)],
    [t("order.eta"), day(order.eta)],
    prep && [t("order.prepDay"), day(order.prep_day)],
    prep && [t("order.shipMethod"), t(`shipMethod.${order.ship_method}`)],
    prep && [t("order.shipmentCreator"), t(`shipmentCreator.${order.shipment_creator}`)],
    [t("order.shipments"), t(`inboundShipments.${order.inbound_shipments ?? "single"}`)],
    [t("order.cases"), order.total_cases],
    [t("order.pallets"), order.pallets],
    prep && [t("order.storage"), t(`storage.${order.storage_requested}`)],
    prep && [t("order.extras"), order.extras?.length ? order.extras.map((x) => t(`extras.${x}`)).join(", ") : "—"],
    [t("order.estimate"), fmtMoney(order.estimated_cost)],
    [t("order.invoiceNumber"), order.invoice_number || "—"],
    !prep && order.stocked_at && [t("order.stockedAt"), fmtDate(order.stocked_at)],
  ].filter(Boolean);
  return (
    <>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{k}</dt>
            <dd className="text-sm text-primary mt-0.5">{v}</dd>
          </div>
        ))}
      </dl>
      {order.quote_url && (
        <a href={order.quote_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-sm font-semibold text-third hover:underline">
          {t("order.viewQuote")} →
        </a>
      )}
      {order.client_notes && <p className="mt-4 text-sm text-gray-600 whitespace-pre-line border-t border-gray-100 pt-3">{order.client_notes}</p>}
    </>
  );
}

const OrderDetail = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t } = useT();
  const { user, role } = useAuth();
  const isStaff = role === "staff" || role === "admin";

  const [order, setOrder] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("orders")
      .select(`*, clients(company, full_name, email, phone, language),
               order_items(*), order_events(*), order_files(*),
               shipments_inbound(*, tracking_events(*))`)
      .eq("id", id)
      .maybeSingle();
    if (err) setError(err.message);
    else if (!data) setError(t("orderDetail.notFound"));
    else {
      data.order_items.sort((a, b) => a.position - b.position);
      data.order_events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      data.order_files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrder(data);
    }
    if (isStaff) {
      const { data: cl } = await supabase.from("order_checklist").select("*").eq("order_id", id);
      setChecklist(cl ?? []);
    }
    setLoading(false);
  }, [id, isStaff, t]);

  useEffect(() => {
    load();
    return subscribeToChanges(`order-${id}`, [
      { table: "orders", filter: `id=eq.${id}` },
      { table: "order_events", filter: `order_id=eq.${id}` },
      { table: "shipments_inbound", filter: `order_id=eq.${id}` },
    ], load);
  }, [id, load]);

  useEffect(() => {
    if (!isStaff) return;
    supabase
      .from("clients")
      .select("id, full_name, email")
      .in("role", ["staff", "admin"])
      .then(({ data }) => setNames(Object.fromEntries((data ?? []).map((c) => [c.id, c.full_name || c.email]))));
  }, [isStaff]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  const closed = CLOSED_STAGES.has(order.stage);

  return (
    <div className="max-w-6xl">
      <Link to={isStaff ? "/portal/ops" : "/portal/orders"} className="text-sm text-gray-400 hover:text-third">← {t("common.back")}</Link>
      <div className="mt-2">
        <PageHeader
          title={`${t("orderDetail.title")} ${orderCode(order)}`}
          subtitle={isStaff ? `${order.clients?.company || "—"} · ${order.clients?.full_name || ""} ${order.clients?.email || ""}` : undefined}
          action={
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-third bg-third/10 px-2.5 py-1 rounded-full">
                {order.type === "3pl" ? "3PL" : "PREP"}
              </span>
              <StageBadge stage={order.stage} />
            </div>
          }
        />
      </div>

      {params.get("created") && (
        <div className="mb-5 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl">
          {t("orderDetail.created")}
          {params.get("uploadFailed") && <span className="block text-red-600 mt-1">{t("orderDetail.uploadFailed")}</span>}
        </div>
      )}
      {order.stage === "discrepancy" && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl">{t("orderDetail.discrepancyBanner")}</div>
      )}
      {order.stage === "quote" && !isStaff && (
        <div className="mb-5 bg-purple-50 border border-purple-200 text-purple-800 text-sm px-4 py-3 rounded-xl">{t("orderDetail.quoteBanner")}</div>
      )}

      {!isStaff && <Progress order={order} />}
      <ReceivedBar items={order.order_items} />

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Cancelled orders stay movable so staff can reopen them; only paid is final. */}
          {isStaff && order.stage !== "paid" && (
            <Card title={t("staff.moveStage")}>
              <StageActions order={order} onChanged={load} />
            </Card>
          )}
          {isStaff && scanModeFor(order) && (
            <Card title={t("scan.title")}>
              <ScanPanel order={order} onChanged={load} />
            </Card>
          )}
          <Card title={t("orderDetail.products")}>
            <ItemsTable
              items={order.order_items}
              editable={isStaff && RECEIVING_STAGES.has(order.stage)}
              onSaved={load}
              showPrep={order.type !== "3pl"}
              showPrepped={order.type === "prep" && ["scheduled", "prepped", "shipped", "in_storage"].includes(order.stage)}
              canEditFnsku={isStaff && order.type === "prep" && !CLOSED_STAGES.has(order.stage)}
            />
          </Card>
          <Card title={t("orderDetail.tracking")}>
            <TrackingPanel
              order={order}
              shipments={order.shipments_inbound}
              canAdd={!closed && (isStaff || order.stage === "awaiting_inventory" || order.stage === "quote")}
              isStaff={isStaff}
              onChanged={load}
            />
          </Card>
          <Card title={t("orderDetail.timeline")}>
            <Timeline events={order.order_events} userId={user?.id} names={names} />
            {isStaff && (
              <div className="border-t border-gray-100 mt-5 pt-5">
                <NoteForm orderId={order.id} onChanged={load} />
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t("orderDetail.summary")}>
            <Summary order={order} />
          </Card>
          {isStaff && (
            <>
              <Card title={t("staff.checklist")}>
                <Checklist items={checklist} onChanged={load} />
              </Card>
              <Card title={t("staff.planningBilling")}>
                <OrderAdminFields order={order} onChanged={load} />
                <StripeInvoice order={order} onChanged={load} />
              </Card>
            </>
          )}
          <Card title={t("orderDetail.files")}>
            <FilesPanel orderId={order.id} files={order.order_files} isStaff={isStaff} onChanged={load} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
