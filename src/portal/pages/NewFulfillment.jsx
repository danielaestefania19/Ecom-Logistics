import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useT } from "../i18n";
import { PACKAGING } from "../lib/estimate";
import { groupOrders, parseCsv } from "../lib/csv";
import { uploadFulfillmentFile } from "../lib/orders";
import { useThreePlClients } from "../lib/useThreePlClients";
import { btnPrimary, btnSecondary, Card, ClientPicker, ErrorBanner, Field, inputCls, PageHeader } from "../components/ui";

const CHANNELS = ["shopify", "tiktok", "amazon", "other"];

const createFulfillment = (order, lines) =>
  supabase.rpc("create_fulfillment_order", { p_order: order, p_lines: lines });

function ManualForm({ clientId, products }) {
  const { t } = useT();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    channel: "shopify",
    external_ref: "",
    recipient_name: "",
    ship_to: "",
    packaging: "small_medium_box",
    carrier: "",
    tracking_number: "",
    notes: "",
  });
  const [lines, setLines] = useState([{ product_id: "", qty: 1 }]);
  const [labels, setLabels] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setLine = (i, k, v) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const byId = Object.fromEntries(products.map((p) => [p.product_id, p]));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const valid = lines.filter((l) => l.product_id && Number(l.qty) > 0);
    if (!valid.length) return setError(t("fulfillment.errors.noLines"));
    if (!form.recipient_name.trim()) return setError(t("fulfillment.errors.noRecipient"));
    setBusy(true);
    const { data: id, error: err } = await createFulfillment(
      { ...form, client_id: clientId },
      valid.map((l) => ({ product_id: l.product_id, qty: Number(l.qty) }))
    );
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    for (const f of labels) {
      try {
        await uploadFulfillmentFile(id, f, "label");
      } catch {
        // The order exists; the label can be re-uploaded from its page.
      }
    }
    navigate(`/portal/fulfillment/${id}`, { replace: true });
  };

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card
          title={t("fulfillment.products")}
          action={
            <button type="button" className="text-xs font-semibold text-third" onClick={() => setLines((l) => [...l, { product_id: "", qty: 1 }])}>
              + {t("fulfillment.addLine")}
            </button>
          }
        >
          {products.length === 0 && <p className="text-sm text-gray-400 mb-3">{t("fulfillment.noProducts")}</p>}
          <div className="space-y-3">
            {lines.map((l, i) => {
              const p = byId[l.product_id];
              const available = p ? p.on_hand - p.reserved : null;
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-8">
                    <Field label={t("item.sku")}>
                      <select className={inputCls} value={l.product_id} onChange={(e) => setLine(i, "product_id", e.target.value)}>
                        <option value="">{t("fulfillment.pickProduct")}</option>
                        {products.map((pr) => (
                          <option key={pr.product_id} value={pr.product_id}>
                            {pr.sku}{pr.name ? ` — ${pr.name}` : ""} ({t("inventory.available")}: {pr.on_hand - pr.reserved})
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="col-span-3">
                    <Field label={t("item.units")}>
                      <input className={inputCls} type="number" min="1" inputMode="numeric" value={l.qty} onChange={(e) => setLine(i, "qty", e.target.value)} />
                    </Field>
                  </div>
                  <div className="col-span-1 pb-2.5 text-right">
                    {lines.length > 1 && (
                      <button type="button" className="text-xs text-gray-400 hover:text-red-500" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}>✕</button>
                    )}
                  </div>
                  {p && Number(l.qty) > available && (
                    <p className="col-span-12 text-xs text-red-600 -mt-1">{t("fulfillment.shortWarning", { n: available })}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card title={t("fulfillment.shipTo")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("fulfillment.channel")}>
              <select className={inputCls} value={form.channel} onChange={(e) => set("channel", e.target.value)}>
                {CHANNELS.map((c) => <option key={c} value={c}>{t(`channel.${c}`)}</option>)}
              </select>
            </Field>
            <Field label={t("fulfillment.externalRef")} hint={t("fulfillment.externalRefHint")}>
              <input className={inputCls} value={form.external_ref} onChange={(e) => set("external_ref", e.target.value)} placeholder="#1001" />
            </Field>
            <Field label={t("fulfillment.recipient")} required>
              <input className={inputCls} value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} />
            </Field>
            <Field label={t("fulfillment.packaging")}>
              <select className={inputCls} value={form.packaging} onChange={(e) => set("packaging", e.target.value)}>
                {PACKAGING.map((p) => <option key={p} value={p}>{t(`packaging.${p}`)}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("fulfillment.address")}>
                <textarea className={inputCls} rows={3} value={form.ship_to} onChange={(e) => set("ship_to", e.target.value)} />
              </Field>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title={t("fulfillment.label")}>
          <div className="space-y-4">
            <Field label={t("fulfillment.labelFile")} hint={t("fulfillment.labelHint")}>
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={(e) => setLabels([...e.target.files])}
                className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-third/10 file:px-3 file:py-2 file:text-third file:font-semibold"
              />
            </Field>
            <Field label={t("fulfillment.carrier")}>
              <input className={inputCls} value={form.carrier} onChange={(e) => set("carrier", e.target.value)} placeholder="USPS, UPS…" />
            </Field>
            <Field label={t("fulfillment.tracking")}>
              <input className={inputCls} value={form.tracking_number} onChange={(e) => set("tracking_number", e.target.value)} />
            </Field>
            <Field label={t("order.notes")}>
              <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </Field>
          </div>
        </Card>
        {error && <ErrorBanner message={error} />}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3`}>
          {busy ? t("common.saving") : t("fulfillment.create")}
        </button>
      </div>
    </form>
  );
}

function CsvImport({ clientId, products }) {
  const { t } = useT();
  const [channel, setChannel] = useState("shopify");
  const [packaging, setPackaging] = useState("small_medium_box");
  const [parsed, setParsed] = useState(null);
  const [existing, setExisting] = useState(new Set());
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const bySku = useMemo(() => Object.fromEntries(products.map((p) => [p.sku.toLowerCase(), p])), [products]);

  useEffect(() => {
    supabase
      .from("fulfillment_orders")
      .select("external_ref")
      .eq("client_id", clientId)
      .eq("channel", channel)
      .neq("status", "cancelled")
      .not("external_ref", "is", null)
      .then(({ data }) => setExisting(new Set((data ?? []).map((r) => r.external_ref))));
  }, [clientId, channel, results]);

  const onFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    setError(null);
    setResults(null);
    if (!file) return;
    try {
      const orders = groupOrders(parseCsv(await file.text()));
      if (!orders.length) return setError(t("fulfillment.csv.noOrders"));
      setParsed(orders);
    } catch (err) {
      setError(err.message);
    }
  };

  const preview = (parsed ?? []).map((o) => {
    const unknown = o.lines.filter((l) => !bySku[l.sku.toLowerCase()]).map((l) => l.sku);
    const problem = existing.has(o.external_ref)
      ? t("fulfillment.csv.duplicate")
      : !o.lines.length
        ? t("fulfillment.csv.noLines")
        : unknown.length
          ? t("fulfillment.csv.unknownSku", { skus: unknown.join(", ") })
          : !o.recipient_name
            ? t("fulfillment.errors.noRecipient")
            : null;
    return { ...o, problem };
  });
  const importable = preview.filter((o) => !o.problem);

  const runImport = async () => {
    setBusy(true);
    const out = [];
    for (const o of importable) {
      const { data: id, error: err } = await createFulfillment(
        { client_id: clientId, channel, packaging, external_ref: o.external_ref, recipient_name: o.recipient_name, ship_to: o.ship_to },
        o.lines.map((l) => ({ product_id: bySku[l.sku.toLowerCase()].product_id, qty: l.qty }))
      );
      out.push({ ref: o.external_ref, id, error: err?.message });
    }
    setBusy(false);
    setResults(out);
    setParsed(null);
  };

  return (
    <div className="space-y-6">
      <Card title={t("fulfillment.csv.title")}>
        <p className="text-sm text-gray-500 mb-4">{t("fulfillment.csv.help")}</p>
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <Field label={t("fulfillment.channel")}>
            <select className={inputCls} value={channel} onChange={(e) => setChannel(e.target.value)}>
              {CHANNELS.map((c) => <option key={c} value={c}>{t(`channel.${c}`)}</option>)}
            </select>
          </Field>
          <Field label={t("fulfillment.defaultPackaging")}>
            <select className={inputCls} value={packaging} onChange={(e) => setPackaging(e.target.value)}>
              {PACKAGING.map((p) => <option key={p} value={p}>{t(`packaging.${p}`)}</option>)}
            </select>
          </Field>
          <label className={`${btnSecondary} cursor-pointer`}>
            {t("fulfillment.csv.choose")}
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={onFile} />
          </label>
        </div>
        {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
      </Card>

      {parsed && (
        <Card
          title={t("fulfillment.csv.preview", { ok: importable.length, total: preview.length })}
          action={
            <button type="button" onClick={runImport} disabled={busy || !importable.length} className={btnPrimary}>
              {busy ? t("common.saving") : t("fulfillment.csv.import", { n: importable.length })}
            </button>
          }
        >
          <ul className="divide-y divide-gray-100">
            {preview.map((o) => (
              <li key={o.external_ref} className="py-2.5 flex flex-wrap items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-primary">{o.external_ref} · <span className="font-normal text-gray-600">{o.recipient_name || "—"}</span></p>
                  <p className="text-xs text-gray-400">{o.lines.map((l) => `${l.sku} × ${l.qty}`).join(", ")}</p>
                </div>
                {o.problem ? (
                  <span className="text-xs font-semibold text-red-600">{o.problem}</span>
                ) : (
                  <span className="text-xs font-semibold text-green-700">{t("fulfillment.csv.ready")}</span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {results && (
        <Card title={t("fulfillment.csv.done", { n: results.filter((r) => !r.error).length })}>
          <ul className="space-y-1 text-sm">
            {results.map((r) => (
              <li key={r.ref} className="flex justify-between gap-3">
                <span>{r.ref}</span>
                {r.error ? (
                  <span className="text-red-600 text-xs">{r.error}</span>
                ) : (
                  <Link to={`/portal/fulfillment/${r.id}`} className="text-third text-xs font-semibold">{t("fulfillment.csv.open")} →</Link>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

const NewFulfillment = () => {
  const { t } = useT();
  const clients = useThreePlClients(true);
  const [clientId, setClientId] = useState("");
  const [mode, setMode] = useState("manual");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!clientId) return setProducts([]);
    supabase
      .from("inventory_levels")
      .select("*")
      .eq("client_id", clientId)
      .eq("active", true)
      .order("sku")
      .then(({ data }) => setProducts(data ?? []));
  }, [clientId]);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={t("fulfillment.newTitle")}
        subtitle={t("fulfillment.newSubtitle")}
        action={<Link to="/portal/fulfillment" className={btnSecondary}>{t("common.cancel")}</Link>}
      />
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <ClientPicker clients={clients} value={clientId} onChange={setClientId} />
        {["manual", "csv"].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`text-sm font-semibold px-4 py-2 rounded-full transition ${mode === m ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            {t(`fulfillment.mode.${m}`)}
          </button>
        ))}
      </div>
      {!clientId ? (
        <p className="text-sm text-gray-400">{t("fulfillment.pickClientFirst")}</p>
      ) : mode === "manual" ? (
        <ManualForm key={clientId} clientId={clientId} products={products} />
      ) : (
        <CsvImport key={clientId} clientId={clientId} products={products} />
      )}
    </div>
  );
};

export default NewFulfillment;
