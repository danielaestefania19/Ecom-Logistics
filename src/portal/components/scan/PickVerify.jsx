import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useT } from "../../i18n";
import { beep } from "../../lib/beep";
import { matchPick } from "../../lib/scan";
import { btnPrimary, btnSecondary, ErrorBanner, inputCls } from "../ui";
import ScanInput from "./ScanInput";

// Verifies a 3PL order item by item before packing. Counts live in the browser only:
// the record of truth is the status change, this just catches wrong or missing items.
const PickVerify = ({ f }) => {
  const { t } = useT();
  const [aliases, setAliases] = useState([]);
  const [counts, setCounts] = useState({});
  const [result, setResult] = useState(null);
  const [unknown, setUnknown] = useState(null);
  const [teachLine, setTeachLine] = useState("");
  const [error, setError] = useState(null);
  const lines = f.fulfillment_lines;

  const loadAliases = useCallback(async () => {
    const { data } = await supabase.from("sku_barcodes").select("code, sku").eq("client_id", f.client_id);
    setAliases(data ?? []);
  }, [f.client_id]);

  useEffect(() => {
    loadAliases();
  }, [loadAliases]);

  const count = (line) => {
    const n = counts[line.id] ?? 0;
    if (n >= line.qty) {
      beep(false);
      return setResult({ tone: "error", text: t("scan.pickOver", { sku: line.products.sku, of: line.qty }) });
    }
    beep(true);
    setCounts((c) => ({ ...c, [line.id]: n + 1 }));
    setResult({ tone: "ok", text: t("scan.counted", { sku: line.products.sku, n: n + 1, of: line.qty, delta: "+1" }) });
  };

  const onScan = (code) => {
    setUnknown(null);
    const line = matchPick(code, lines, aliases);
    if (line) return count(line);
    beep(false);
    setUnknown(code);
    setTeachLine("");
    setResult({ tone: "error", text: t("scan.notInOrder", { code }) });
  };

  const teach = async () => {
    const line = lines.find((l) => l.id === teachLine);
    if (!line) return;
    setError(null);
    const { error: err } = await supabase
      .from("sku_barcodes")
      .insert({ client_id: f.client_id, code: unknown, sku: line.products.sku, kind: "upc" });
    if (err) return setError(err.message);
    if (!line.products.barcode) {
      await supabase.from("products").update({ barcode: unknown }).eq("id", line.products.id).is("barcode", null);
    }
    setUnknown(null);
    await loadAliases();
    count(line);
  };

  const done = lines.every((l) => (counts[l.id] ?? 0) >= l.qty);

  return (
    <div className="space-y-4">
      <ScanInput onScan={onScan} result={result} hint={t("scan.hint.pick")} />
      <ul className="space-y-1.5">
        {lines.map((l) => {
          const n = counts[l.id] ?? 0;
          return (
            <li key={l.id} className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">{l.products.sku}</span>
              <span className={`font-bold ${n >= l.qty ? "text-green-700" : "text-gray-500"}`}>{n}/{l.qty}</span>
            </li>
          );
        })}
      </ul>
      {done && <p className="text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2">✓ {t("scan.allVerified")}</p>}
      {unknown && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <p className="text-sm text-amber-900">{t("scan.teachPick", { code: unknown })}</p>
          <div className="flex gap-2">
            <select className={inputCls} value={teachLine} onChange={(e) => setTeachLine(e.target.value)}>
              <option value="">{t("scan.pickSku")}</option>
              {lines.map((l) => <option key={l.id} value={l.id}>{l.products.sku}{l.products.name ? ` — ${l.products.name}` : ""}</option>)}
            </select>
            <button type="button" onClick={teach} disabled={!teachLine} className={btnPrimary}>{t("scan.save")}</button>
            <button type="button" onClick={() => setUnknown(null)} className={btnSecondary}>{t("common.cancel")}</button>
          </div>
        </div>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
};

export default PickVerify;
