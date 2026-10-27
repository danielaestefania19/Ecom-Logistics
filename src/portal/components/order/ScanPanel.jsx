import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { beep } from "../../lib/beep";
import { matchFnsku, matchReceiving, scanModeFor } from "../../lib/scan";
import { btnPrimary, btnSecondary, ErrorBanner, inputCls } from "../ui";
import ScanInput from "../scan/ScanInput";

// Receiving counts units by UPC (learning unknown codes once); prep mode verifies FNSKU labels
// before the shipment goes to Amazon.
const ScanPanel = ({ order, onChanged }) => {
  const { t } = useT();
  const mode = scanModeFor(order);
  const [aliases, setAliases] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [result, setResult] = useState(null);
  const [unknown, setUnknown] = useState(null);
  const [teachSku, setTeachSku] = useState("");
  const [last, setLast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const refreshTimer = useRef(null);

  const loadAliases = useCallback(async () => {
    const { data } = await supabase.from("sku_barcodes").select("code, sku, kind").eq("client_id", order.client_id);
    setAliases(data ?? []);
  }, [order.client_id]);

  useEffect(() => {
    loadAliases();
  }, [loadAliases]);

  useEffect(() => () => clearTimeout(refreshTimer.current), []);

  // Units-per-scan is for full cases at receiving; FNSKU checks are always one label at a time.
  useEffect(() => {
    setMultiplier(1);
    setLast(null);
    setResult(null);
  }, [mode]);

  // Reload the order shortly after scanning stops instead of after every beep.
  const scheduleRefresh = () => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(onChanged, 1200);
  };

  const field = mode === "prep" ? "prepped" : "received";

  const apply = async (item, delta) => {
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.rpc("scan_increment", { p_item: item.id, p_field: field, p_delta: delta });
    setBusy(false);
    if (err) {
      beep(false);
      setError(err.message);
      return;
    }
    const counted = field === "prepped" ? data[0].prepped_qty : data[0].received_qty;
    const over = counted > item.expected_qty;
    beep(!over);
    setLast({ item, delta });
    setResult({
      tone: over ? "warn" : "ok",
      text: t(over ? "scan.over" : "scan.counted", { sku: item.sku, n: counted, of: item.expected_qty, delta: delta > 0 ? `+${delta}` : delta }),
    });
    scheduleRefresh();
  };

  const onScan = (code) => {
    setUnknown(null);
    if (mode === "prep") {
      const m = matchFnsku(code, order.order_items, aliases);
      if (m.item && !m.error) return apply(m.item, Number(multiplier) || 1);
      beep(false);
      // A label nobody entered on the order: let staff assign it to a SKU that still has no FNSKU.
      if (m.error === "unknown" && order.order_items.some((i) => !i.fnsku)) {
        setUnknown(code);
        setTeachSku("");
        return setResult({ tone: "warn", text: t("scan.unknownFnsku", { code }) });
      }
      return setResult({
        tone: "error",
        text: m.error === "notFnsku" ? t("scan.notFnsku", { sku: m.item.sku }) : t("scan.unknownFnsku", { code }),
      });
    }
    const item = matchReceiving(code, order.order_items, aliases);
    if (item) return apply(item, Number(multiplier) || 1);
    beep(false);
    setUnknown(code);
    setTeachSku("");
    setResult({ tone: "warn", text: t("scan.unknown", { code }) });
  };

  const teach = async () => {
    const item = order.order_items.find((i) => i.sku === teachSku);
    if (!item) return;
    const { error: err } =
      mode === "prep"
        ? await supabase.from("order_items").update({ fnsku: unknown }).eq("id", item.id)
        : await supabase.from("sku_barcodes").insert({ client_id: order.client_id, code: unknown, sku: item.sku, kind: "upc" });
    if (err) return setError(err.message);
    setUnknown(null);
    if (mode === "prep") onChanged();
    else await loadAliases();
    apply(item, Number(multiplier) || 1);
  };

  // In the FNSKU check only SKUs still missing their label code can take a new one.
  const teachable = mode === "prep" ? order.order_items.filter((i) => !i.fnsku) : order.order_items;

  if (!mode) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-third bg-third/10 px-2.5 py-1 rounded-full">
          {t(`scan.mode.${mode}`)}
        </span>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          {t("scan.perScan")}
          <input
            type="number"
            min="1"
            value={multiplier}
            onChange={(e) => setMultiplier(e.target.value)}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-center"
          />
        </label>
        {last && (
          <button type="button" onClick={() => apply(last.item, -last.delta)} disabled={busy} className="text-xs font-semibold text-gray-500 hover:text-red-600 underline">
            {t("scan.undo")}
          </button>
        )}
      </div>

      <ScanInput onScan={onScan} result={result} busy={busy} hint={t(`scan.hint.${mode}`)} />

      {unknown && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <p className="text-sm text-amber-900">{t(mode === "prep" ? "scan.teachFnsku" : "scan.teach", { code: unknown })}</p>
          <div className="flex gap-2">
            <select className={inputCls} value={teachSku} onChange={(e) => setTeachSku(e.target.value)}>
              <option value="">{t("scan.pickSku")}</option>
              {teachable.map((i) => (
                <option key={i.id} value={i.sku}>{i.sku}{i.product_name ? ` — ${i.product_name}` : ""}</option>
              ))}
            </select>
            <button type="button" onClick={teach} disabled={!teachSku} className={btnPrimary}>{t(mode === "prep" ? "scan.saveFnsku" : "scan.save")}</button>
            <button type="button" onClick={() => setUnknown(null)} className={btnSecondary}>{t("common.cancel")}</button>
          </div>
        </div>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
};

export default ScanPanel;
