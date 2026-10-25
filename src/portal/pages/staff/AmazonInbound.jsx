import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { advanceInboundPlan, createInboundPlan, getInboundPlan, listConnections, pollInboundPlan } from "../../lib/amazonApi";
import { btnPrimary, btnSecondary, Card, ErrorBanner, PageHeader, Spinner } from "../../components/ui";

const STEPS = [
  "create", "packing_options", "set_packing",
  "placement_options", "confirm_placement",
  "transport_options", "confirm_transport", "done",
];

function StepIndicator({ currentStep }) {
  const { t } = useT();
  const visibleSteps = STEPS.filter((s) => s !== "create");
  const idx = visibleSteps.indexOf(currentStep);
  return (
    <ol className="flex gap-1 mb-6 flex-wrap">
      {visibleSteps.map((s, i) => (
        <li key={s} className="flex items-center gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${i <= idx ? "bg-third text-white" : "bg-gray-100 text-gray-400"}`}>
            {t(`amazon.inbound.steps.${s}`) || s}
          </span>
          {i < visibleSteps.length - 1 && <span className="text-gray-300">›</span>}
        </li>
      ))}
    </ol>
  );
}

function CreateStep({ orderId, connectionId, onCreated, onError }) {
  const { t } = useT();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    supabase
      .from("order_items")
      .select("id, sku, fnsku, expected_qty, prep_type, product_name")
      .eq("order_id", orderId)
      .order("position")
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, [orderId]);

  const start = async () => {
    setBusy(true);
    try {
      const res = await createInboundPlan(connectionId, orderId);
      onCreated(res.plan);
    } catch (err) {
      onError(err.message);
    }
    setBusy(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{t("amazon.inbound.items")}</p>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
            <th className="pb-2 pr-4">SKU</th>
            <th className="pb-2 pr-4">FNSKU</th>
            <th className="pb-2 pr-4">Name</th>
            <th className="pb-2 text-right">Qty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((it) => (
            <tr key={it.id}>
              <td className="py-2 pr-4 font-mono text-xs">{it.sku}</td>
              <td className="py-2 pr-4 font-mono text-xs text-gray-500">{it.fnsku || "—"}</td>
              <td className="py-2 pr-4 text-gray-700">{it.product_name || "—"}</td>
              <td className="py-2 text-right font-semibold">{it.expected_qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className={btnPrimary} onClick={start} disabled={busy || items.length === 0}>
        {busy ? t("amazon.inbound.polling") : t("amazon.inbound.startBtn")}
      </button>
    </div>
  );
}

function OptionSelector({ options, labelKey, valueKey, onSelect, busy }) {
  const { t } = useT();
  return (
    <div className="space-y-2">
      {(options ?? []).map((opt, i) => (
        <div key={opt[valueKey] || i} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-sm">
            <p className="font-medium">{opt[labelKey] || JSON.stringify(opt)}</p>
            {opt.fees && <p className="text-xs text-gray-400 mt-0.5">Fees: {JSON.stringify(opt.fees)}</p>}
          </div>
          <button className={btnSecondary} disabled={busy} onClick={() => onSelect(opt[valueKey] || opt)}>
            {t("amazon.inbound.selectOption")}
          </button>
        </div>
      ))}
    </div>
  );
}

function BoxForm({ onSubmit, busy }) {
  const { t } = useT();
  const [weight, setWeight] = useState("");
  const [l, setL] = useState(""); const [w, setW] = useState(""); const [h, setH] = useState("");
  const [packingOptionId, setPackingOptionId] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Enter packing option ID and box dimensions to continue.</p>
      <input placeholder="Packing Option ID" value={packingOptionId} onChange={(e) => setPackingOptionId(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full" />
      <div className="grid grid-cols-4 gap-2">
        <input placeholder={t("amazon.inbound.boxWeight")} value={weight} onChange={(e) => setWeight(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm col-span-1" />
        <input placeholder="L (in)" value={l} onChange={(e) => setL(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="W (in)" value={w} onChange={(e) => setW(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="H (in)" value={h} onChange={(e) => setH(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      </div>
      <button
        className={btnPrimary}
        disabled={busy || !packingOptionId || !weight || !l || !w || !h}
        onClick={() => onSubmit({
          packingOptionId,
          boxes: [{ weight: { value: parseFloat(weight), unit: "LB" }, dimensions: { length: parseFloat(l), width: parseFloat(w), height: parseFloat(h), unitOfMeasurement: "IN" }, quantity: 1 }],
        })}
      >
        {t("amazon.inbound.confirmBtn")}
      </button>
    </div>
  );
}

const AmazonInbound = () => {
  const { planId: routePlanId } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useT();

  const orderId = searchParams.get("orderId");
  const [plan, setPlan] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectionId, setConnectionId] = useState(searchParams.get("connectionId") || "");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [stepData, setStepData] = useState(null);
  const pollRef = useRef(null);

  const isNew = routePlanId === "new";

  const loadPlan = useCallback(async (id) => {
    try {
      const p = await getInboundPlan(id);
      setPlan(p);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const conns = await listConnections();
      setConnections(conns.filter((c) => c.status === "active"));
      if (!connectionId && conns.length === 1) setConnectionId(conns[0].id);
      if (!isNew) await loadPlan(routePlanId);
      setLoading(false);
    })();
  }, [routePlanId, isNew, connectionId, loadPlan]);

  // Poll while in_progress
  useEffect(() => {
    if (!plan || plan.status !== "in_progress" || !connectionId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await pollInboundPlan(plan.id, connectionId);
        if (res.done) {
          clearInterval(pollRef.current);
          await loadPlan(plan.id);
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [plan, connectionId, loadPlan]);

  const handleCreated = (newPlan) => {
    setPlan(newPlan);
    window.history.replaceState({}, "", `/portal/amazon/inbound/${newPlan.id}${orderId ? `?orderId=${orderId}` : ""}`);
  };

  const advance = async (step, payload = {}) => {
    setBusy(true);
    setError(null);
    try {
      const res = await advanceInboundPlan(plan.id, step, connectionId, payload);
      setStepData(res);
      await loadPlan(plan.id);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  if (loading) return <Spinner />;

  const currentStep = plan?.current_step ?? "create";
  const backTo = orderId ? `/portal/orders/${orderId}` : "/portal/amazon";

  return (
    <div className="max-w-3xl">
      <Link to={backTo} className="text-sm text-gray-400 hover:text-third">← {t("amazon.inbound.backToOrder")}</Link>
      <div className="mt-2">
        <PageHeader title={t("amazon.inbound.title")} subtitle={t("amazon.inbound.subtitle")} />
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {/* Connection selector — only shown for new plans */}
      {isNew && !plan && connections.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Amazon connection</label>
          <select value={connectionId} onChange={(e) => setConnectionId(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full">
            <option value="">Select connection…</option>
            {connections.map((c) => (
              <option key={c.id} value={c.id}>{c.clients?.company || c.clients?.email} — {c.selling_partner_id}</option>
            ))}
          </select>
        </div>
      )}

      {plan && <StepIndicator currentStep={currentStep} />}

      <Card>
        {/* ── DONE ──────────────────────────────────────────────────────── */}
        {currentStep === "done" && (
          <div className="text-center py-6">
            <p className="text-green-700 font-semibold text-lg mb-2">✓ {t("amazon.inbound.done")}</p>
            <Link to={backTo} className="text-sm text-third hover:underline">{t("amazon.inbound.backToOrder")}</Link>
          </div>
        )}

        {/* ── IN_PROGRESS poll ──────────────────────────────────────────── */}
        {plan?.status === "in_progress" && currentStep !== "done" && (
          <div className="flex items-center gap-3 py-4">
            <Spinner />
            <p className="text-sm text-gray-500">{t("amazon.inbound.polling")}</p>
          </div>
        )}

        {/* ── CREATE ───────────────────────────────────────────────────── */}
        {(isNew && !plan) && (
          <CreateStep
            orderId={orderId}
            connectionId={connectionId}
            onCreated={handleCreated}
            onError={setError}
          />
        )}

        {/* ── PACKING OPTIONS ───────────────────────────────────────────── */}
        {currentStep === "packing_options" && plan?.status !== "in_progress" && (
          <div>
            <p className="text-sm text-gray-500 mb-3">{t("amazon.inbound.packingOptions")}</p>
            <button className={btnPrimary} disabled={busy} onClick={() => advance("packing_options")}>
              {busy ? t("amazon.inbound.polling") : t("amazon.inbound.confirmBtn")}
            </button>
          </div>
        )}

        {/* ── SET PACKING (select option + box dims) ──────────────────────── */}
        {currentStep === "set_packing" && plan?.status !== "in_progress" && (
          <div>
            {plan?.payload?.packing_options?.length ? (
              <>
                <p className="text-sm text-gray-500 mb-3">{t("amazon.inbound.packingOptions")}</p>
                <OptionSelector
                  options={plan.payload.packing_options}
                  labelKey="packingOptionId"
                  valueKey="packingOptionId"
                  onSelect={() => {}} // selection passed via BoxForm
                  busy={busy}
                />
              </>
            ) : null}
            <BoxForm onSubmit={(p) => advance("set_packing", p)} busy={busy} />
          </div>
        )}

        {/* ── PLACEMENT OPTIONS ─────────────────────────────────────────── */}
        {currentStep === "placement_options" && plan?.status !== "in_progress" && (
          <div>
            <button className={btnPrimary} disabled={busy} onClick={() => advance("placement_options")}>
              {busy ? t("amazon.inbound.polling") : t("amazon.inbound.confirmBtn")}
            </button>
          </div>
        )}

        {/* ── CONFIRM PLACEMENT ─────────────────────────────────────────── */}
        {currentStep === "confirm_placement" && plan?.status !== "in_progress" && (
          <div>
            <p className="text-sm text-gray-500 mb-3">{t("amazon.inbound.placementOptions")}</p>
            <OptionSelector
              options={plan?.payload?.placement_options ?? stepData?.placement_options ?? []}
              labelKey="placementOptionId"
              valueKey="placementOptionId"
              onSelect={(id) => advance("confirm_placement", { placementOptionId: id })}
              busy={busy}
            />
          </div>
        )}

        {/* ── TRANSPORT OPTIONS ─────────────────────────────────────────── */}
        {currentStep === "transport_options" && plan?.status !== "in_progress" && (
          <div>
            <button className={btnPrimary} disabled={busy} onClick={() => advance("transport_options")}>
              {busy ? t("amazon.inbound.polling") : t("amazon.inbound.confirmBtn")}
            </button>
          </div>
        )}

        {/* ── CONFIRM TRANSPORT ─────────────────────────────────────────── */}
        {currentStep === "confirm_transport" && plan?.status !== "in_progress" && (
          <div>
            <p className="text-sm text-gray-500 mb-3">{t("amazon.inbound.transportOptions")}</p>
            <OptionSelector
              options={plan?.payload?.transport_options ?? stepData?.transportation_options ?? []}
              labelKey="transportationOptionId"
              valueKey="transportationOptionId"
              onSelect={(id) => advance("confirm_transport", { transportationOptionId: id, shipmentId: plan?.payload?.shipment_id ?? "" })}
              busy={busy}
            />
          </div>
        )}

        {/* ── Error state ───────────────────────────────────────────────── */}
        {plan?.status === "error" && (
          <div>
            <p className="text-red-600 text-sm">{plan.error || t("amazon.inbound.errorOccurred")}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AmazonInbound;
