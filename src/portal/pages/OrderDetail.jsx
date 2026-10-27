import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { CLIENT_STEPS, orderCode, subscribeToChanges } from "../lib/orders";

const CLIENT_STEPS_3PL = ["awaiting_inventory", "received", "in_storage", "paid"];
const PROGRESS_INDEX_3PL = { awaiting_inventory: 0, received: 1, discrepancy: 1, in_storage: 2, invoiced: 2, paid: 3 };
import { btnSecondary, Card, ErrorBanner, inputCls, PageHeader, Spinner, StageBadge } from "../components/ui";
import Timeline from "../components/order/Timeline";
import ItemsTable from "../components/order/ItemsTable";
import TrackingPanel from "../components/order/TrackingPanel";
import FilesPanel from "../components/order/FilesPanel";
import { Checklist, NoteForm, OrderAdminFields, StageActions, StripeInvoice } from "../components/order/StaffPanel";
import ScanPanel from "../components/order/ScanPanel";
import StoragePanel from "../components/order/StoragePanel";
import PackingListPanel from "../components/order/PackingListPanel";
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
// Once counted, staff can decide how much of a PREP order stays at the warehouse while the rest ships.
const STORAGE_STAGES = new Set(["received", "scheduled", "prepped", "in_storage", "shipped", "invoiced", "paid"]);

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

// Clients can cancel their own order, with a reason, until the merchandise arrives.
function ClientCancel({ order, onChanged }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const cancel = async () => {
    if (!reason.trim()) return setError(t("staff.cancelReasonRequired"));
    if (!window.confirm(t("orderDetail.cancelConfirm"))) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("cancel_my_order", { p_order: order.id, p_reason: reason.trim() });
    setBusy(false);
    if (err) return setError(err.message);
    onChanged();
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-gray-500 hover:text-red-600 underline">
        {t("orderDetail.cancelOrder")}
      </button>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">{t("orderDetail.cancelHelp")}</p>
      <textarea className={inputCls} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("orderDetail.cancelReason")} />
      <div className="flex gap-2">
        <button type="button" onClick={cancel} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition disabled:opacity-50">
          {busy ? t("common.saving") : t("orderDetail.cancelOrder")}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={btnSecondary}>{t("common.back")}</button>
      </div>
      {error && <ErrorBanner message={error} />}
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
               shipments_inbound(*, tracking_events(*)), storage_releases(*, storage_release_lines(*)),
               packing_boxes(*, packing_box_contents(*))`)
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
      { table: "storage_releases", filter: `order_id=eq.${id}` },
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
      {order.stage === "cancelled" && (
        <div className="mb-5 bg-gray-50 border border-gray-200 text-gray-700 text-sm px-4 py-3 rounded-xl">
          {t("orderDetail.cancelledBanner", {
            reason:
              [...order.order_events].reverse().find((e) => e.to_stage === "cancelled" && e.note && e.note !== "stage_reverted")?.note ?? "—",
          })}
        </div>
      )}
      {order.stage === "quote" && !isStaff && (
        <div className="mb-5 bg-purple-50 border border-purple-200 text-purple-800 text-sm px-4 py-3 rounded-xl">{t("orderDetail.quoteBanner")}</div>
      )}

      {!isStaff && <Progress order={order} />}
      <ReceivedBar items={order.order_items} />

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Staff can always move an order: forward, reopen a cancelled one, or step back a mistake. */}
          {isStaff && (
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
              canEditItems={isStaff && order.type === "prep" && !CLOSED_STAGES.has(order.stage)}
              clientId={order.client_id}
            />
          </Card>
          {order.type === "prep" && STORAGE_STAGES.has(order.stage) && (isStaff || order.packing_sent_at) && (
            <Card title={t("packing.title")}>
              <PackingListPanel order={order} isStaff={isStaff} onChanged={load} />
            </Card>
          )}
          {order.type === "prep" && STORAGE_STAGES.has(order.stage) && (isStaff || order.order_items.some((i) => i.stored_qty > 0)) && (
            <Card title={t("storagePanel.title")}>
              <StoragePanel order={order} isStaff={isStaff} onChanged={load} />
            </Card>
          )}
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
            {!isStaff && ["quote", "awaiting_inventory"].includes(order.stage) && (
              <div className="border-t border-gray-100 mt-5 pt-4">
                <ClientCancel order={order} onChanged={load} />
              </div>
            )}
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
