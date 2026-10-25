import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { fulfillmentCode, setFulfillmentStatus, subscribeToChanges } from "../../lib/orders";
import { useThreePlClients } from "../../lib/useThreePlClients";
import { btnPrimary, btnSecondary, Card, ClientPicker, ErrorBanner, FulfillmentBadge, PageHeader, Spinner } from "../../components/ui";

const PickList = () => {
  const { t } = useT();
  const clients = useThreePlClients(true);
  const [clientId, setClientId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    let q = supabase
      .from("fulfillment_orders")
      .select("id, number, status, external_ref, recipient_name, packaging, clients(company, email), fulfillment_lines(qty, products(id, sku, name, location))")
      .in("status", ["pending", "picking"])
      .order("created_at");
    if (clientId) q = q.eq("client_id", clientId);
    const { data, error: err } = await q;
    if (err) setError(err.message);
    else setOrders(data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
    return subscribeToChanges("picklist", [{ table: "fulfillment_orders" }], load);
  }, [load]);

  // One row per product, sorted by shelf location so the picker walks the aisles once.
  const picks = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      for (const l of o.fulfillment_lines) {
        const p = l.products;
        const row = map.get(p.id) ?? { ...p, client: o.clients?.company || o.clients?.email, qty: 0, orders: [] };
        row.qty += l.qty;
        row.orders.push(fulfillmentCode(o));
        map.set(p.id, row);
      }
    }
    return [...map.values()].sort((a, b) => {
      if (!a.location !== !b.location) return a.location ? -1 : 1;
      return (a.location ?? "").localeCompare(b.location ?? "", undefined, { numeric: true }) || a.sku.localeCompare(b.sku);
    });
  }, [orders]);

  const pending = orders.filter((o) => o.status === "pending");

  const startAll = async () => {
    setBusy(true);
    setError(null);
    try {
      for (const o of pending) await setFulfillmentStatus(o.id, "picking");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
    load();
  };

  return (
    <div className="max-w-5xl">
      <div className="print:hidden">
        <PageHeader
          title={t("pickList.title")}
          subtitle={t("pickList.subtitle")}
          action={
            <div className="flex flex-wrap gap-2">
              <ClientPicker clients={clients} value={clientId} onChange={setClientId} allowAll />
              <button type="button" onClick={() => window.print()} className={btnSecondary}>{t("pickList.print")}</button>
              <button type="button" onClick={startAll} disabled={busy || !pending.length} className={btnPrimary}>
                {busy ? t("common.saving") : t("pickList.startAll", { n: pending.length })}
              </button>
            </div>
          }
        />
      </div>
      <h1 className="hidden print:block text-xl font-bold mb-4">{t("pickList.title")} — {new Date().toLocaleString()}</h1>

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={load} />}
      {!loading && !error && orders.length === 0 && <p className="text-sm text-gray-400">{t("pickList.empty")}</p>}

      {!loading && orders.length > 0 && (
        <div className="space-y-6">
          <Card title={t("pickList.byProduct", { n: picks.length })}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
                  <th className="py-2 pr-3 font-semibold">{t("inventory.location")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("item.sku")}</th>
                  <th className="py-2 pr-3 font-semibold text-right">{t("item.units")}</th>
                  <th className="py-2 font-semibold">{t("pickList.orders")}</th>
                </tr>
              </thead>
              <tbody>
                {picks.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 align-top">
                    <td className="py-3 pr-3 font-mono font-bold text-primary">{p.location || "—"}</td>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-primary">{p.sku}</p>
                      <p className="text-xs text-gray-400">{[p.name, p.client].filter(Boolean).join(" · ")}</p>
                    </td>
                    <td className="py-3 pr-3 text-right text-lg font-bold">{p.qty}</td>
                    <td className="py-3 text-xs text-gray-500">{p.orders.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title={t("pickList.byOrder", { n: orders.length })}>
            <ul className="divide-y divide-gray-100">
              {orders.map((o) => (
                <li key={o.id} className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <Link to={`/portal/fulfillment/${o.id}`} className="font-semibold text-primary hover:text-third">
                      {fulfillmentCode(o)} {o.external_ref && <span className="font-normal text-gray-500">({o.external_ref})</span>}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {[o.clients?.company, o.recipient_name, t(`packaging.${o.packaging}`)].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-gray-600">{o.fulfillment_lines.map((l) => `${l.products.sku} × ${l.qty}`).join(", ")}</p>
                  </div>
                  <FulfillmentBadge status={o.status} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PickList;
