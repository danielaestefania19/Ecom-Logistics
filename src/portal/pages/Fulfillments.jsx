import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { fulfillmentCode, OPEN_FULFILLMENT, subscribeToChanges } from "../lib/orders";
import { useThreePlClients } from "../lib/useThreePlClients";
import { btnPrimary, btnSecondary, ClientPicker, ErrorBanner, FulfillmentBadge, inputCls, PageHeader, Spinner } from "../components/ui";

const TABS = {
  open: OPEN_FULFILLMENT,
  shipped: ["shipped"],
  cancelled: ["cancelled"],
};

const Fulfillments = () => {
  const { t, fmtDate } = useT();
  const { role } = useAuth();
  const isStaff = role === "staff" || role === "admin";
  const clients = useThreePlClients(isStaff);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("open");
  const [clientId, setClientId] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    let q = supabase
      .from("fulfillment_orders")
      .select("id, number, status, channel, external_ref, recipient_name, created_at, shipped_at, tracking_number, clients(company, email), fulfillment_lines(qty), fulfillment_files(id, kind)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (clientId) q = q.eq("client_id", clientId);
    const { data, error: err } = await q;
    if (err) setError(err.message);
    else setRows(data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
    return subscribeToChanges("fulfillment-list", [{ table: "fulfillment_orders" }], load);
  }, [load]);

  const counts = Object.fromEntries(Object.entries(TABS).map(([k, st]) => [k, rows.filter((r) => st.includes(r.status)).length]));
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => TABS[tab].includes(r.status))
      .filter((r) => !q || [String(r.number), r.external_ref, r.recipient_name, r.tracking_number, r.clients?.company].some((v) => (v ?? "").toLowerCase().includes(q)));
  }, [rows, tab, query]);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={t("fulfillment.title")}
        subtitle={isStaff ? t("fulfillment.subtitleStaff") : t("fulfillment.subtitleClient")}
        action={
          isStaff && (
            <div className="flex flex-wrap gap-2">
              <Link to="/portal/ops/picklist" className={btnSecondary}>{t("nav.pickList")}</Link>
              <Link to="/portal/fulfillment/new" className={btnPrimary}>+ {t("fulfillment.new")}</Link>
            </div>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {Object.keys(TABS).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition ${tab === k ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            {t(`fulfillment.tab.${k}`)} ({counts[k]})
          </button>
        ))}
        <div className="flex-1" />
        {isStaff && <ClientPicker clients={clients} value={clientId} onChange={setClientId} allowAll />}
        <input className={`${inputCls} max-w-[14rem]`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("fulfillment.search")} />
      </div>

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={load} />}
      {!loading && !error && shown.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-14 text-center">
          <p className="text-primary font-semibold mb-1">{t("fulfillment.empty")}</p>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">{isStaff ? t("fulfillment.emptyHintStaff") : t("fulfillment.emptyHintClient")}</p>
        </div>
      )}
      {!loading && !error && shown.length > 0 && (
        <div className="space-y-2">
          {shown.map((r) => {
            const units = (r.fulfillment_lines ?? []).reduce((n, l) => n + l.qty, 0);
            const hasLabel = (r.fulfillment_files ?? []).some((f) => f.kind === "label");
            return (
              <Link
                key={r.id}
                to={`/portal/fulfillment/${r.id}`}
                className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3.5 hover:border-third/50 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    {fulfillmentCode(r)}
                    {isStaff && <span className="font-normal text-gray-500"> · {r.clients?.company || r.clients?.email}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[t(`channel.${r.channel}`) + (r.external_ref ? ` ${r.external_ref}` : ""), r.recipient_name, t("orders.units", { n: units }), fmtDate(r.created_at)].join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!hasLabel && OPEN_FULFILLMENT.includes(r.status) && !r.tracking_number && (
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">{t("fulfillment.noLabel")}</span>
                  )}
                  <FulfillmentBadge status={r.status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Fulfillments;
