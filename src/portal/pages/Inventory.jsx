import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { estimateMonth, PACKAGING } from "../lib/estimate";
import { subscribeToChanges } from "../lib/orders";
import { useThreePlClients } from "../lib/useThreePlClients";
import { btnPrimary, btnSecondary, Card, ClientPicker, ErrorBanner, Field, inputCls, PageHeader, Spinner } from "../components/ui";

const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};

function StorageCard({ client, isStaff, onSaved }) {
  const { t, fmtMoney } = useT();
  const [counts, setCounts] = useState({ bins: 0, shelves: 0, pallets: 0 });
  const [shipped, setShipped] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCounts({ bins: client.storage_bins ?? 0, shelves: client.storage_shelves ?? 0, pallets: client.storage_pallets ?? 0 });
    supabase
      .from("fulfillment_orders")
      .select("packaging")
      .eq("client_id", client.id)
      .eq("status", "shipped")
      .gte("shipped_at", monthStart())
      .then(({ data }) => setShipped((data ?? []).map((r) => r.packaging)));
  }, [client]);

  const est = estimateMonth({ shippedPackagings: shipped, ...counts });

  const save = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("set_client_storage", {
      p_client: client.id,
      p_bins: Number(counts.bins) || 0,
      p_shelves: Number(counts.shelves) || 0,
      p_pallets: Number(counts.pallets) || 0,
    });
    setBusy(false);
    if (err) setError(err.message);
    else onSaved();
  };

  return (
    <Card title={t("inventory.storageTitle")}>
      <div className="grid grid-cols-3 gap-3">
        {["bins", "shelves", "pallets"].map((k) => (
          <Field key={k} label={t(`inventory.storage.${k}`)}>
            {isStaff ? (
              <input
                type="number"
                min="0"
                inputMode="numeric"
                className={inputCls}
                value={counts[k]}
                onChange={(e) => setCounts((c) => ({ ...c, [k]: e.target.value }))}
              />
            ) : (
              <p className="text-lg font-bold text-primary">{counts[k]}</p>
            )}
          </Field>
        ))}
      </div>
      {isStaff && (
        <button type="button" onClick={save} disabled={busy} className={`${btnSecondary} mt-3`}>
          {busy ? t("common.saving") : t("common.save")}
        </button>
      )}
      {error && <div className="mt-3"><ErrorBanner message={error} /></div>}

      <div className="mt-5 border-t border-gray-100 pt-4 space-y-1.5 text-sm">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">{t("inventory.monthEstimate")}</p>
        {est.lines.length === 0 && <p className="text-gray-400">{t("inventory.monthEmpty")}</p>}
        {est.lines.map((l) => (
          <div key={l.key} className="flex justify-between gap-3">
            <span className="text-gray-600">
              {t(`estimate.line.${l.key}`)} <span className="text-gray-400">× {l.qty}</span>
            </span>
            <span className="font-medium text-primary">{fmtMoney(l.total)}</span>
          </div>
        ))}
        {est.lines.length > 0 && (
          <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-primary">
            <span>{t("estimate.total")}</span>
            <span>{fmtMoney(est.total)}</span>
          </div>
        )}
        <p className="text-[11px] text-gray-400 pt-1">{t("inventory.monthDisclaimer")}</p>
      </div>
    </Card>
  );
}

function Movements({ productId }) {
  const { t, fmtDateTime } = useT();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    supabase
      .from("inventory_movements")
      .select("id, qty, kind, note, created_at, orders(order_number), fulfillment_orders(number)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(25)
      .then(({ data }) => setRows(data ?? []));
  }, [productId]);

  if (!rows) return <p className="text-xs text-gray-400 py-2">…</p>;
  if (!rows.length) return <p className="text-xs text-gray-400 py-2">{t("inventory.noMovements")}</p>;
  return (
    <ul className="py-2 space-y-1">
      {rows.map((m) => (
        <li key={m.id} className="text-xs text-gray-600 flex flex-wrap gap-x-2">
          <span className={`font-bold w-12 text-right ${m.qty > 0 ? "text-green-700" : "text-red-600"}`}>{m.qty > 0 ? `+${m.qty}` : m.qty}</span>
          <span>{t(`inventory.kind.${m.kind}`)}</span>
          {m.orders && <span className="text-gray-400">#{m.orders.order_number}</span>}
          {m.fulfillment_orders && <span className="text-gray-400">#{m.fulfillment_orders.number}</span>}
          {m.note && <span className="text-gray-500">— {m.note}</span>}
          <span className="text-gray-400 ml-auto">{fmtDateTime(m.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}

function StaffTools({ product, onDone }) {
  const { t } = useT();
  const [mode, setMode] = useState(null);
  const [adj, setAdj] = useState({ qty: "", kind: "adjustment", note: "" });
  const [edit, setEdit] = useState({
    name: product.name ?? "",
    barcode: product.barcode ?? "",
    location: product.location ?? "",
    packaging: product.packaging,
    fragile: product.fragile,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    const { error: err } = await fn();
    setBusy(false);
    if (err) return setError(err.message);
    setMode(null);
    onDone();
  };

  const saveAdjust = (e) => {
    e.preventDefault();
    run(() =>
      supabase.rpc("adjust_inventory", { p_product: product.product_id, p_qty: Number(adj.qty), p_kind: adj.kind, p_note: adj.note })
    );
  };

  const saveEdit = (e) => {
    e.preventDefault();
    run(() =>
      supabase
        .from("products")
        .update({
          name: edit.name.trim() || null,
          barcode: edit.barcode.trim() || null,
          location: edit.location.trim() || null,
          packaging: edit.packaging,
          fragile: edit.fragile,
        })
        .eq("id", product.product_id)
    );
  };

  return (
    <div className="py-2">
      <div className="flex gap-2">
        <button type="button" className="text-xs font-semibold text-third" onClick={() => setMode(mode === "adjust" ? null : "adjust")}>
          {t("inventory.adjust")}
        </button>
        <span className="text-gray-300">·</span>
        <button type="button" className="text-xs font-semibold text-third" onClick={() => setMode(mode === "edit" ? null : "edit")}>
          {t("inventory.editProduct")}
        </button>
      </div>

      {mode === "adjust" && (
        <form onSubmit={saveAdjust} className="grid sm:grid-cols-4 gap-2 mt-3 items-end">
          <Field label={t("inventory.adjustQty")} hint={t("inventory.adjustQtyHint")}>
            <input className={inputCls} type="number" required value={adj.qty} onChange={(e) => setAdj((a) => ({ ...a, qty: e.target.value }))} />
          </Field>
          <Field label={t("inventory.adjustKind")}>
            <select className={inputCls} value={adj.kind} onChange={(e) => setAdj((a) => ({ ...a, kind: e.target.value }))}>
              {["adjustment", "damage", "return"].map((k) => (
                <option key={k} value={k}>{t(`inventory.kind.${k}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t("inventory.adjustReason")}>
            <input className={inputCls} required value={adj.note} onChange={(e) => setAdj((a) => ({ ...a, note: e.target.value }))} />
          </Field>
          <button type="submit" disabled={busy || !Number(adj.qty)} className={btnPrimary}>{t("common.save")}</button>
        </form>
      )}

      {mode === "edit" && (
        <form onSubmit={saveEdit} className="grid sm:grid-cols-3 gap-2 mt-3 items-end">
          <Field label={t("item.productName")}>
            <input className={inputCls} value={edit.name} onChange={(e) => setEdit((x) => ({ ...x, name: e.target.value }))} />
          </Field>
          <Field label={t("inventory.barcode")}>
            <input className={inputCls} value={edit.barcode} onChange={(e) => setEdit((x) => ({ ...x, barcode: e.target.value }))} />
          </Field>
          <Field label={t("inventory.location")}>
            <input className={inputCls} value={edit.location} onChange={(e) => setEdit((x) => ({ ...x, location: e.target.value }))} placeholder="A-03-2" />
          </Field>
          <Field label={t("fulfillment.packaging")}>
            <select className={inputCls} value={edit.packaging} onChange={(e) => setEdit((x) => ({ ...x, packaging: e.target.value }))}>
              {PACKAGING.map((p) => <option key={p} value={p}>{t(`packaging.${p}`)}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-600 py-2.5">
            <input type="checkbox" className="accent-third" checked={edit.fragile} onChange={(e) => setEdit((x) => ({ ...x, fragile: e.target.checked }))} />
            {t("inventory.fragile")}
          </label>
          <button type="submit" disabled={busy} className={btnPrimary}>{t("common.save")}</button>
        </form>
      )}
      {error && <div className="mt-2"><ErrorBanner message={error} /></div>}
    </div>
  );
}

const Inventory = () => {
  const { t } = useT();
  const { user, role } = useAuth();
  const isStaff = role === "staff" || role === "admin";
  const staffClients = useThreePlClients(isStaff);

  const [clientId, setClientId] = useState("");
  const [client, setClient] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);

  const activeClientId = isStaff ? clientId : user?.id;

  const load = useCallback(async () => {
    if (!activeClientId) {
      setLevels([]);
      setClient(null);
      setLoading(false);
      return;
    }
    setError(null);
    const [lv, cl] = await Promise.all([
      supabase.from("inventory_levels").select("*").eq("client_id", activeClientId).order("sku"),
      supabase.from("clients").select("id, company, storage_bins, storage_shelves, storage_pallets").eq("id", activeClientId).single(),
    ]);
    if (lv.error) setError(lv.error.message);
    else setLevels(lv.data ?? []);
    setClient(cl.data ?? null);
    setLoading(false);
  }, [activeClientId]);

  useEffect(() => {
    load();
    return subscribeToChanges(`inventory-${activeClientId}`, [{ table: "inventory_movements" }, { table: "fulfillment_orders" }], load);
  }, [load, activeClientId]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = levels.filter((l) => l.active);
    if (!q) return list;
    return list.filter((l) => [l.sku, l.name, l.barcode, l.location].some((v) => (v ?? "").toLowerCase().includes(q)));
  }, [levels, query]);

  const totals = shown.reduce((a, l) => ({ on: a.on + l.on_hand, res: a.res + l.reserved }), { on: 0, res: 0 });

  return (
    <div className="max-w-6xl">
      <PageHeader
        title={t("inventory.title")}
        subtitle={t("inventory.subtitle")}
        action={isStaff && <ClientPicker clients={staffClients} value={clientId} onChange={setClientId} />}
      />

      {isStaff && !clientId && <p className="text-sm text-gray-400">{t("inventory.pickClient")}</p>}
      {loading && activeClientId && <Spinner />}
      {error && <ErrorBanner message={error} onRetry={load} />}

      {!loading && client && (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <Card
              title={t("inventory.stockTitle", { n: shown.length })}
              action={<input className={`${inputCls} max-w-[14rem] py-1.5`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("inventory.search")} />}
            >
              {shown.length === 0 ? (
                <p className="text-sm text-gray-400">{t("inventory.empty")}</p>
              ) : (
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400">
                        <th className="py-2 pr-3 font-semibold">{t("item.sku")}</th>
                        <th className="py-2 pr-3 font-semibold">{t("inventory.location")}</th>
                        <th className="py-2 pr-3 font-semibold text-right">{t("inventory.onHand")}</th>
                        <th className="py-2 pr-3 font-semibold text-right">{t("inventory.reserved")}</th>
                        <th className="py-2 font-semibold text-right">{t("inventory.available")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((l) => {
                        const available = l.on_hand - l.reserved;
                        return [
                          <tr key={l.product_id} onClick={() => setOpen(open === l.product_id ? null : l.product_id)} className="border-t border-gray-100 cursor-pointer hover:bg-gray-50">
                            <td className="py-3 pr-3">
                              <p className="font-semibold text-primary">{l.sku}</p>
                              <p className="text-xs text-gray-400">{[l.name, l.fragile && t("inventory.fragile")].filter(Boolean).join(" · ")}</p>
                            </td>
                            <td className="py-3 pr-3 text-gray-600">{l.location || "—"}</td>
                            <td className="py-3 pr-3 text-right font-medium">{l.on_hand}</td>
                            <td className="py-3 pr-3 text-right text-gray-500">{l.reserved || "—"}</td>
                            <td className={`py-3 text-right font-bold ${available <= 0 ? "text-red-600" : "text-primary"}`}>{available}</td>
                          </tr>,
                          open === l.product_id && (
                            <tr key={`${l.product_id}-detail`} className="bg-gray-50/60">
                              <td colSpan={5} className="px-3">
                                {isStaff && <StaffTools product={l} onDone={load} />}
                                <Movements productId={l.product_id} />
                              </td>
                            </tr>
                          ),
                        ];
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200 font-bold text-primary">
                        <td className="py-3" colSpan={2}>{t("item.total")}</td>
                        <td className="py-3 pr-3 text-right">{totals.on}</td>
                        <td className="py-3 pr-3 text-right">{totals.res || "—"}</td>
                        <td className="py-3 text-right">{totals.on - totals.res}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              <p className="text-[11px] text-gray-400 mt-3">{t("inventory.howItWorks")}</p>
            </Card>
          </div>
          <StorageCard client={client} isStaff={isStaff} onSaved={load} />
        </div>
      )}
    </div>
  );
};

export default Inventory;
