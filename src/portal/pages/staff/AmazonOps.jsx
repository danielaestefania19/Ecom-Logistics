import { useCallback, useEffect, useState } from "react";
import { useT } from "../../i18n";
import { CONNECTION_STATUS_STYLE, marketplaceName } from "../../lib/amazon";
import { listConnections, syncConnection } from "../../lib/amazonApi";
import { btnSecondary, Card, ErrorBanner, PageHeader, Spinner } from "../../components/ui";

const AmazonOps = () => {
  const { t, fmtDateTime } = useT();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setConnections(await listConnections());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sync = async (connectionId) => {
    setSyncing(connectionId);
    try {
      await syncConnection(connectionId);
      await load();
    } catch (err) {
      setError(err.message);
    }
    setSyncing(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl">
      <PageHeader title={t("amazon.ops.title")} subtitle={t("amazon.ops.subtitle")} />
      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={load} /></div>}

      <Card>
        {connections.length === 0 ? (
          <p className="text-sm text-gray-400">{t("amazon.none")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-4">{t("amazon.ops.client")}</th>
                  <th className="pb-2 pr-4">{t("amazon.ops.sellerId")}</th>
                  <th className="pb-2 pr-4">{t("amazon.ops.marketplaces")}</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">{t("amazon.ops.lastSync")}</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {connections.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-4 font-medium">{c.clients?.company || c.clients?.email || "—"}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-600">{c.selling_partner_id}</td>
                    <td className="py-2.5 pr-4 text-gray-500 text-xs">{c.marketplace_ids.map(marketplaceName).join(", ")}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONNECTION_STATUS_STYLE[c.status]}`}>
                        {t(`amazon.status.${c.status}`)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">
                      {c.last_sync_at ? fmtDateTime(c.last_sync_at) : t("amazon.sync.never")}
                      {c.last_error && <span className="block text-red-500">{c.last_error}</span>}
                    </td>
                    <td className="py-2.5">
                      {c.status === "active" && (
                        <button
                          className={btnSecondary}
                          disabled={syncing === c.id}
                          onClick={() => sync(c.id)}
                        >
                          {syncing === c.id ? t("amazon.sync.syncing") : t("amazon.ops.syncNow")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AmazonOps;
