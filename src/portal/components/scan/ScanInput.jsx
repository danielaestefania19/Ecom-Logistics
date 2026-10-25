import { useEffect, useRef, useState } from "react";
import { useT } from "../../i18n";
import { normalizeCode } from "../../lib/scan";

const TONE = {
  ok: "bg-green-50 border-green-300 text-green-800",
  warn: "bg-amber-50 border-amber-300 text-amber-900",
  error: "bg-red-50 border-red-300 text-red-800",
};

// Scanners in keyboard mode type the code and press Enter into whatever has focus, so this field
// keeps focus while the panel is open.
const ScanInput = ({ onScan, result, busy, hint }) => {
  const { t } = useT();
  const ref = useRef(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!busy) ref.current?.focus();
  }, [busy, result]);

  // Handle the scanner's terminator key directly instead of relying on implicit form submission,
  // which was skipped right after the "link this code" box closed. Some scanners end with Tab.
  const onKeyDown = (e) => {
    if (e.key !== "Enter" && e.key !== "Tab") return;
    e.preventDefault();
    const code = normalizeCode(e.currentTarget.value);
    setValue("");
    if (code) onScan(code);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          ref={ref}
          value={value}
          onKeyDown={onKeyDown}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder={t("scan.placeholder")}
          aria-label={t("scan.placeholder")}
          className="w-full border-2 border-third/40 focus:border-third rounded-2xl px-5 py-4 text-xl font-mono tracking-wider text-primary bg-white focus:outline-none focus:ring-4 focus:ring-third/15"
        />
      </form>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {result && (
        <div className={`border-2 rounded-xl px-4 py-3 text-sm font-semibold ${TONE[result.tone]}`} role="status" aria-live="polite">
          {result.text}
        </div>
      )}
    </div>
  );
};

export default ScanInput;
