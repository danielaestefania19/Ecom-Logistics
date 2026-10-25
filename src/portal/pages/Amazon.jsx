import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { CONNECTION_STATUS_STYLE, connectErrorKey, marketplaceName, parseConnectReturn } from "../lib/amazon";
import { disconnectAmazon, listConnections, startAmazonConnect } from "../lib/amazonApi";
import { btnPrimary, btnSecondary, Card, ClientPicker, ErrorBanner, PageHeader, Spinner } from "../components/ui";

function ConnectionRow({ connection, showClient, onDisconnect, busy }) {
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
        {connection.last_error && <p className="text-red-600 text-xs mt-1">{connection.last_error}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONNECTION_STATUS_STYLE[connection.status]}`}>
          {t(`amazon.status.${connection.status}`)}
        </span>
        {connection.status !== "revoked" && (
          <button className={btnSecondary} disabled={busy} onClick={() => onDisconnect(connection.id)}>
            {t("amazon.disconnect")}
          </button>
        )}
      </div>
    </div>
  );
}

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

  useEffect(() => {
    load();
  }, [load]);

  // Show the result of the OAuth round trip once, then clean the URL.
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
    <div className="max-w-3xl">
      <PageHeader title={t("amazon.title")} subtitle={t(isStaff ? "amazon.subtitleStaff" : "amazon.subtitle")} />

      {notice?.kind === "connected" && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
          {t("amazon.connectedOk")}
        </div>
      )}
      {notice?.kind === "error" && <div className="mb-4"><ErrorBanner message={t(connectErrorKey(notice.code))} /></div>}
      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={load} /></div>}

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
              <ConnectionRow key={c.id} connection={c} showClient={isStaff} onDisconnect={disconnect} busy={busy} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Amazon;
