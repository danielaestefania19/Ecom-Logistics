import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { CONNECTION_STATUS_STYLE, connectErrorKey, marketplaceName, parseConnectReturn } from "../lib/amazon";
import { disconnectAmazon, listAmazonOrders, listConnections, listFbaInventory, startAmazonConnect, syncConnection } from "../lib/amazonApi";
import { btnPrimary, btnSecondary, Card, ClientPicker, ErrorBanner, PageHeader, Spinner } from "../components/ui";

function ConnectionRow({ connection, showClient, onDisconnect, onSync, busy }) {
  const { t, fmtDateTime } = useT();
  const client = connection.clients;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3">
      <div className="min-w-0">
        <p className="text-primary font-semibold text-sm">
          {t("amazon.seller")} {connection.selling_partner_id}
          {showClient && <span className="text-gray-500 font-normal"> · {client?.company || client?.email}</span>}
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          {connection.marketplace_ids.map(marketplaceName).join(", ")} · {t("amazon.connectedOn", { date: fmtDateTime(connection.connected_at) })}
        </p>
        {connection.last_sync_at && (
          <p className="text-gray-400 text-xs">{t("amazon.sync.lastSync", { date: fmtDateTime(connection.last_sync_at) })}</p>
        )}
        {connection.last_error && <p className="text-red-600 text-xs mt-1">{connection.last_error}</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONNECTION_STATUS_STYLE[connection.status]}`}>
          {t(`amazon.status.${connection.status}`)}
        </span>
        {connection.status === "active" && (
          <button className={btnSecondary} disabled={busy} onClick={() => onSync(connection.id)}>
            {t("amazon.sync.button")}
          </button>
        )}
        {connection.status !== "revoked" && (
          <button className={btnSecondary} disabled={busy} onClick={() => onDisconnect(connection.id)}>
            {t("amazon.disconnect")}
          </button>
        )}
      </div>
    </div>
  );
}

function OrdersTab({ connections, isStaff }) {
  const { t, fmtDate, fmtMoney } = useT();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConn, setSelectedConn] = useState("");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setOrders(await listAmazonOrders(selectedConn || undefined));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [selectedConn]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;

  return (
    <div>
      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={load} /></div>}
      {isStaff && connections.length > 1 && (
        <select
          value={selectedConn}
          onChange={(e) => setSelectedConn(e.target.value)}
          className="mb-4 border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">{t("newOrder.selectClient")}</option>
          {connections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.clients?.company || c.clients?.email} — {c.selling_partner_id}
            </option>
          ))}
        </select>
      )}
      {orders.length === 0 ? (
        <p className="text-sm text-gray-400">{t("amazon.orders.none")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="pb-2 pr-4">{t("amazon.orders.orderId")}</th>
                <th className="pb-2 pr-4">{t("amazon.orders.date")}</th>
                <th className="pb-2 pr-4">{t("amazon.orders.status")}</th>
                <th className="pb-2 pr-4">{t("amazon.orders.fba")}</th>
                <th className="pb-2 pr-4">{t("amazon.orders.city")}</th>
                <th className="pb-2">{t("amazon.orders.total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2 pr-4 font-mono text-xs">{o.amazon_order_id}</td>
                  <td className="py-2 pr-4 text-gray-500">{fmtDate(o.purchase_date)}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.status === "Shipped" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{o.is_fba ? "FBA" : "MFN"}</td>
                  <td className="py-2 pr-4 text-gray-500">{[o.ship_city, o.ship_state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="py-2 text-gray-700">{o.order_total != null ? fmtMoney(o.order_total) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InventoryTab({ connections, isStaff }) {
  const { t, fmtDateTime } = useT();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConn, setSelectedConn] = useState("");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setInventory(await listFbaInventory(selectedConn || undefined));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [selectedConn]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;

  return (
    <div>
      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={load} /></div>}
      {isStaff && connections.length > 1 && (
        <select
          value={selectedConn}
          onChange={(e) => setSelectedConn(e.target.value)}
          className="mb-4 border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">{t("newOrder.selectClient")}</option>
          {connections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.clients?.company || c.clients?.email} — {c.selling_partner_id}
            </option>
          ))}
        </select>
      )}
      {inventory.length === 0 ? (
        <p className="text-sm text-gray-400">{t("amazon.inventory.none")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="pb-2 pr-4">{t("amazon.inventory.sku")}</th>
                <th className="pb-2 pr-4">{t("amazon.inventory.fnsku")}</th>
                <th className="pb-2 pr-4">{t("amazon.inventory.asin")}</th>
                <th className="pb-2 pr-4">{t("amazon.inventory.name")}</th>
                <th className="pb-2 pr-4 text-right">{t("amazon.inventory.onHand")}</th>
                <th className="pb-2 pr-4 text-right">{t("amazon.inventory.inbound")}</th>
                <th className="pb-2 text-right">{t("amazon.inventory.reserved")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-4 font-mono text-xs">{item.sku}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-500">{item.fnsku || "—"}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-500">{item.asin || "—"}</td>
                  <td className="py-2 pr-4 text-gray-700 truncate max-w-xs">{item.product_name || "—"}</td>
                  <td className="py-2 pr-4 text-right font-semibold">{item.total_quantity}</td>
                  <td className="py-2 pr-4 text-right text-gray-500">{item.inbound_working + item.inbound_shipped + item.inbound_receiving}</td>
                  <td className="py-2 text-right text-gray-500">{item.reserved_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-3">
            {t("amazon.sync.lastSync", { date: fmtDateTime(inventory[0]?.synced_at) })}
          </p>
        </div>
      )}
    </div>
  );
}

const TAB_CLS = (active) =>
  `px-4 py-2 text-sm font-medium border-b-2 transition ${
    active ? "border-third text-third" : "border-transparent text-gray-400 hover:text-primary"
  }`;

const Amazon = () => {
  const { t } = useT();
  const { role } = useAuth();
  const isStaff = role === "staff" || role === "admin";
  const location = useLocation();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [link, setLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("connect");

  const hasActive = connections.some((c) => c.status === "active");

  const load = useCallback(async () => {
    setError(null);
    try {
      setConnections(await listConnections());
      if (isStaff) {
        const { data, error: err } = await supabase
          .from("clients")
          .select("id, company, full_name, email")
          .eq("role", "client")
          .order("company");
        if (err) throw err;
        setClients(data ?? []);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [isStaff]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const result = parseConnectReturn(location.search);
    if (!result) return;
    setNotice(result);
    navigate(location.pathname, { replace: true });
  }, [location.search, location.pathname, navigate]);

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await startAmazonConnect(isStaff ? clientId : undefined);
      if (isStaff) setLink(url);
      else window.location.assign(url);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const disconnect = async (id) => {
    if (!window.confirm(t("amazon.confirmDisconnect"))) return;
    setBusy(true);
    setError(null);
    try {
      await disconnectAmazon(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const sync = async (connectionId) => {
    setBusy(true);
    setError(null);
    try {
      await syncConnection(connectionId);
      await load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t("amazon.copyFailed"));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl">
      <PageHeader title={t("amazon.title")} subtitle={t(isStaff ? "amazon.subtitleStaff" : "amazon.subtitle")} />

      {notice?.kind === "connected" && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
          {t("amazon.connectedOk")}
        </div>
      )}
      {notice?.kind === "error" && <div className="mb-4"><ErrorBanner message={t(connectErrorKey(notice.code))} /></div>}
      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={load} /></div>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button className={TAB_CLS(tab === "connect")} onClick={() => setTab("connect")}>
          {t("amazon.tabs.connect")}
        </button>
        {hasActive && (
          <>
            <button className={TAB_CLS(tab === "orders")} onClick={() => setTab("orders")}>
              {t("amazon.tabs.orders")}
            </button>
            <button className={TAB_CLS(tab === "inventory")} onClick={() => setTab("inventory")}>
              {t("amazon.tabs.inventory")}
            </button>
          </>
        )}
      </div>

      {/* Connect tab */}
      {tab === "connect" && (
        <>
          <Card title={t("amazon.connect")} className="mb-6">
            <p className="text-sm text-gray-500 mb-4">{t(isStaff ? "amazon.connectHintStaff" : "amazon.connectHint")}</p>
            <div className="flex flex-wrap items-center gap-3">
              {isStaff && <ClientPicker clients={clients} value={clientId} onChange={(v) => { setClientId(v); setLink(null); }} />}
              <button className={btnPrimary} onClick={connect} disabled={busy || (isStaff && !clientId)}>
                {t(isStaff ? "amazon.generateLink" : "amazon.connectButton")}
              </button>
            </div>
            {link && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">{t("amazon.linkHint")}</p>
                <div className="flex items-center gap-2">
                  <input readOnly value={link} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 bg-gray-50" onFocus={(e) => e.target.select()} />
                  <button className={btnSecondary} onClick={copyLink}>{copied ? t("amazon.copied") : t("amazon.copy")}</button>
                </div>
              </div>
            )}
          </Card>

          <Card title={t("amazon.connections")}>
            {connections.length === 0 ? (
              <p className="text-sm text-gray-400">{t("amazon.none")}</p>
            ) : (
              <div className="space-y-3">
                {connections.map((c) => (
                  <ConnectionRow key={c.id} connection={c} showClient={isStaff} onDisconnect={disconnect} onSync={sync} busy={busy} />
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <Card title={t("amazon.orders.title")}>
          <OrdersTab connections={connections} isStaff={isStaff} />
        </Card>
      )}

      {/* Inventory tab */}
      {tab === "inventory" && (
        <Card title={t("amazon.inventory.title")}>
          <InventoryTab connections={connections} isStaff={isStaff} />
        </Card>
      )}
    </div>
  );
};

export default Amazon;
