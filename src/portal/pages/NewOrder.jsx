import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";
import { estimateOrder, EXTRAS, PREP_TYPES } from "../lib/estimate";
import { registerTracking, syncAsana, uploadOrderFile } from "../lib/orders";
import { btnPrimary, btnSecondary, Card, ErrorBanner, Field, inputCls, PageHeader } from "../components/ui";
import CompanyProfileForm from "../components/CompanyProfileForm";

const emptyItem = () => ({ sku: "", fnsku: "", product_name: "", prep_type: "standard", expected_qty: "" });

const splitTracking = (text) =>
  [...new Set(text.split(/[\s,;]+/).map((s) => s.trim().toUpperCase()).filter(Boolean))];

const NewOrder = () => {
  const { t, fmtMoney } = useT();
  const { role, clientProfile } = useAuth();
  const navigate = useNavigate();
  const isStaff = role === "staff" || role === "admin";

  const [type, setType] = useState("prep");
  const [items, setItems] = useState([emptyItem()]);
  const [form, setForm] = useState({
    client_id: "",
    eta: "",
    tracking: "",
    total_cases: "",
    pallets: "",
    ship_method: "spd",
    shipment_creator: "customer",
    storage_requested: "none",
    extras: [],
    client_notes: "",
    declaration_accepted: false,
    signer_name: clientProfile?.full_name ?? "",
  });
  const [labelFiles, setLabelFiles] = useState([]);
  const [clients, setClients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isStaff) return;
    supabase
      .from("clients")
      .select("id, company, full_name, email, services")
      .eq("role", "client")
      .order("company")
      .then(({ data }) => setClients(data ?? []));
  }, [isStaff]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const services = isStaff
    ? clients.find((c) => c.id === form.client_id)?.services ?? ["prep"]
    : clientProfile?.services ?? ["prep"];
  const canDo3pl = services.includes("3pl");
  const is3pl = type === "3pl" && canDo3pl;
  const setItem = (idx, key, value) =>
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  const toggleExtra = (x) =>
    set("extras", form.extras.includes(x) ? form.extras.filter((e) => e !== x) : [...form.extras, x]);

  const estimate = useMemo(
    () =>
      estimateOrder({
        items: is3pl ? [] : items,
        totalCases: Number(form.total_cases) || 0,
        pallets: Number(form.pallets) || 0,
        extras: form.extras,
      }),
    [is3pl, items, form.total_cases, form.pallets, form.extras]
  );

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    const lines = items.filter((i) => i.sku.trim() || i.expected_qty);
    if (!lines.length) return setError(t("newOrder.errors.noItems"));
    if (lines.some((i) => !i.sku.trim() || !(Number(i.expected_qty) > 0))) return setError(t("newOrder.errors.badItem"));
    if (isStaff && !form.client_id) return setError(t("newOrder.errors.noClient"));
    if (!form.declaration_accepted || !form.signer_name.trim()) return setError(t("newOrder.errors.declaration"));

    setSubmitting(true);
    const tracking = splitTracking(form.tracking);
    const { data: orderId, error: rpcError } = await supabase.rpc("create_order", {
      p_order: {
        type: is3pl ? "3pl" : "prep",
        client_id: isStaff ? form.client_id : null,
        shipment_creator: form.shipment_creator,
        ship_method: form.ship_method,
        total_cases: Number(form.total_cases) || 0,
        pallets: Number(form.pallets) || 0,
        extras: form.extras,
        storage_requested: form.storage_requested,
        eta: form.eta || null,
        client_notes: form.client_notes,
        estimated_cost: estimate.total || null,
        declaration_accepted: form.declaration_accepted,
        signer_name: form.signer_name,
      },
      p_items: lines.map((i) => ({ ...i, expected_qty: Number(i.expected_qty) })),
      p_tracking: tracking,
    });

    if (rpcError) {
      setSubmitting(false);
      return setError(rpcError.message);
    }

    // The order exists from here on; label upload problems are reported on the order page instead.
    let uploadFailed = false;
    for (const file of is3pl ? [] : labelFiles) {
      try {
        await uploadOrderFile(orderId, file, "labels");
      } catch {
        uploadFailed = true;
      }
    }
    if (tracking.length) registerTracking(orderId);
    syncAsana(orderId);

    navigate(`/portal/orders/${orderId}?created=1${uploadFailed ? "&uploadFailed=1" : ""}`, { replace: true });
  };

  // Clients complete their company profile once before the first order.
  if (!isStaff && clientProfile && !clientProfile.profile_completed_at) {
    return (
      <div>
        <PageHeader title={t("profile.firstTitle")} subtitle={t("profile.firstSubtitle")} />
        <CompanyProfileForm intro={t("profile.firstIntro")} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-5xl">
      <PageHeader
        title={is3pl ? t("newOrder.title3pl") : t("newOrder.title")}
        subtitle={is3pl ? t("newOrder.subtitle3pl") : t("newOrder.subtitle")}
        action={<Link to="/portal/orders" className={btnSecondary}>{t("common.cancel")}</Link>}
      />

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {isStaff && (
            <Card title={t("newOrder.clientSection")}>
              <Field label={t("newOrder.client")} required>
                <select className={inputCls} value={form.client_id} onChange={(e) => set("client_id", e.target.value)}>
                  <option value="">{t("newOrder.selectClient")}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.full_name || c.email}
                    </option>
                  ))}
                </select>
              </Field>
            </Card>
          )}

          {canDo3pl && (
            <Card title={t("newOrder.typeSection")}>
              <div className="grid sm:grid-cols-2 gap-2">
                {["prep", "3pl"].map((k) => (
                  <label key={k} className={`cursor-pointer px-4 py-3 rounded-xl border text-sm ${type === k ? "border-third bg-third/5 text-third font-semibold" : "border-gray-200 text-gray-600"}`}>
                    <input type="radio" className="sr-only" name="order_type" checked={type === k} onChange={() => setType(k)} />
                    <span className="block">{t(`newOrder.type.${k}`)}</span>
                    <span className="block text-xs font-normal text-gray-400 mt-0.5">{t(`newOrder.typeHint.${k}`)}</span>
                  </label>
                ))}
              </div>
            </Card>
          )}

          <Card
            title={t("newOrder.products")}
            action={
              <button type="button" className="text-xs font-semibold text-third" onClick={() => setItems((l) => [...l, emptyItem()])}>
                + {t("newOrder.addSku")}
              </button>
            }
          >
            <div className="space-y-4">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="col-span-2 sm:col-span-3">
                    <Field label={t("item.sku")} required>
                      <input className={inputCls} value={it.sku} onChange={(e) => setItem(idx, "sku", e.target.value)} />
                    </Field>
                  </div>
                  {is3pl ? (
                    <div className="col-span-2 sm:col-span-6">
                      <Field label={t("item.productName")}>
                        <input className={inputCls} value={it.product_name} onChange={(e) => setItem(idx, "product_name", e.target.value)} />
                      </Field>
                    </div>
                  ) : (
                    <>
                      <div className="sm:col-span-3">
                        <Field label={t("item.fnsku")}>
                          <input className={inputCls} value={it.fnsku} onChange={(e) => setItem(idx, "fnsku", e.target.value)} placeholder="X00…" />
                        </Field>
                      </div>
                      <div className="sm:col-span-3">
                        <Field label={t("item.prepType")}>
                          <select className={inputCls} value={it.prep_type} onChange={(e) => setItem(idx, "prep_type", e.target.value)}>
                            {PREP_TYPES.map((p) => (
                              <option key={p} value={p}>{t(`prepType.${p}`)}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    </>
                  )}
                  <div className="sm:col-span-2">
                    <Field label={!is3pl && it.prep_type === "bundle" ? t("item.bundles") : t("item.units")} required>
                      <input
                        className={inputCls}
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={it.expected_qty}
                        onChange={(e) => setItem(idx, "expected_qty", e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex sm:justify-end">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setItems((l) => l.filter((_, i) => i !== idx))}
                        className="text-xs text-gray-400 hover:text-red-500 py-2.5"
                        aria-label={t("newOrder.removeSku")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {!is3pl && (
                    <div className="col-span-2 sm:col-span-12">
                      <input
                        className={inputCls}
                        value={it.product_name}
                        onChange={(e) => setItem(idx, "product_name", e.target.value)}
                        placeholder={t("item.productNamePlaceholder")}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card title={t("newOrder.inbound")}>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label={t("order.eta")}>
                <input className={inputCls} type="date" value={form.eta} onChange={(e) => set("eta", e.target.value)} />
              </Field>
              <Field label={t("order.cases")}>
                <input className={inputCls} type="number" min="0" inputMode="numeric" value={form.total_cases} onChange={(e) => set("total_cases", e.target.value)} />
              </Field>
              <Field label={t("order.pallets")}>
                <input className={inputCls} type="number" min="0" inputMode="numeric" value={form.pallets} onChange={(e) => set("pallets", e.target.value)} />
              </Field>
              <div className="sm:col-span-3">
                <Field label={t("newOrder.tracking")} hint={t("newOrder.trackingHint")}>
                  <textarea className={inputCls} rows={2} value={form.tracking} onChange={(e) => set("tracking", e.target.value)} placeholder="1Z999AA10123456784, 9400…" />
                </Field>
              </div>
              {is3pl && (
                <div className="sm:col-span-3">
                  <Field label={t("order.notes")}>
                    <textarea className={inputCls} rows={3} value={form.client_notes} onChange={(e) => set("client_notes", e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          </Card>

          {!is3pl && (
          <>
          <Card title={t("newOrder.outbound")}>
            <div className="space-y-5">
              <fieldset>
                <legend className="text-xs font-semibold text-gray-500 mb-2">{t("order.shipMethod")}</legend>
                <div className="flex flex-wrap gap-2">
                  {["spd", "ltl"].map((m) => (
                    <label key={m} className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium ${form.ship_method === m ? "border-third bg-third/5 text-third" : "border-gray-200 text-gray-600"}`}>
                      <input type="radio" className="sr-only" name="ship_method" checked={form.ship_method === m} onChange={() => set("ship_method", m)} />
                      {t(`shipMethod.${m}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-xs font-semibold text-gray-500 mb-2">{t("order.shipmentCreator")}</legend>
                <div className="grid sm:grid-cols-3 gap-2">
                  {["customer", "ecom_seller_central", "ecom_scanpower"].map((c) => (
                    <label key={c} className={`cursor-pointer px-4 py-3 rounded-xl border text-sm ${form.shipment_creator === c ? "border-third bg-third/5 text-third font-semibold" : "border-gray-200 text-gray-600"}`}>
                      <input type="radio" className="sr-only" name="shipment_creator" checked={form.shipment_creator === c} onChange={() => set("shipment_creator", c)} />
                      {t(`shipmentCreator.${c}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              {form.shipment_creator === "customer" && (
                <Field label={t("newOrder.labels")} hint={t("newOrder.labelsHint")}>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={(e) => setLabelFiles([...e.target.files])}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-third/10 file:px-3 file:py-2 file:text-third file:font-semibold"
                  />
                </Field>
              )}
            </div>
          </Card>

          <Card title={t("newOrder.services")}>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {EXTRAS.map((x) => (
                <label key={x} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-third" checked={form.extras.includes(x)} onChange={() => toggleExtra(x)} />
                  {t(`extras.${x}`)}
                </label>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("order.storage")}>
                <select className={inputCls} value={form.storage_requested} onChange={(e) => set("storage_requested", e.target.value)}>
                  {["none", "1m", "2m", "3m_plus"].map((s) => (
                    <option key={s} value={s}>{t(`storage.${s}`)}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label={t("order.notes")}>
                <textarea className={inputCls} rows={3} value={form.client_notes} onChange={(e) => set("client_notes", e.target.value)} />
              </Field>
            </div>
          </Card>
          </>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title={t("estimate.title")}>
            {estimate.lines.length === 0 ? (
              <p className="text-sm text-gray-400">{t("estimate.empty")}</p>
            ) : (
              <div className="space-y-2 text-sm">
                {estimate.lines.map((l) => (
                  <div key={l.key} className="flex justify-between gap-3">
                    <span className="text-gray-600">
                      {t(`estimate.line.${l.key}`)} <span className="text-gray-400">× {l.qty}</span>
                    </span>
                    <span className="font-medium text-primary">{fmtMoney(l.total)}</span>
                  </div>
                ))}
                {estimate.discount > 0 && (
                  <p className="text-xs text-third">{t("estimate.discount", { pct: Math.round(estimate.discount * 100) })}</p>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-primary">
                  <span>{t("estimate.total")}</span>
                  <span>{fmtMoney(estimate.total)}</span>
                </div>
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-3">{t("estimate.disclaimer")}</p>
          </Card>

          <Card title={t("newOrder.declarationTitle")}>
            <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 accent-third flex-shrink-0"
                checked={form.declaration_accepted}
                onChange={(e) => set("declaration_accepted", e.target.checked)}
              />
              {is3pl ? t("newOrder.declaration3pl") : t("newOrder.declaration")}
            </label>
            <div className="mt-4">
              <Field label={t("newOrder.signer")} required>
                <input className={inputCls} value={form.signer_name} onChange={(e) => set("signer_name", e.target.value)} />
              </Field>
            </div>
          </Card>

          {error && <ErrorBanner message={error} />}

          <button type="submit" disabled={submitting} className={`${btnPrimary} w-full py-3`}>
            {submitting ? t("newOrder.submitting") : t("newOrder.submit")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default NewOrder;
