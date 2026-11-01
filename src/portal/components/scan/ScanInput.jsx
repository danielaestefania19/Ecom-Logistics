import { useEffect, useRef, useState } from "react";
import { useT } from "../../i18n";
import { normalizeCode } from "../../lib/scan";
import CameraScanner from "./CameraScanner";

const TONE = {
  ok: "bg-green-50 border-green-300 text-green-800",
  warn: "bg-amber-50 border-amber-300 text-amber-900",
  error: "bg-red-50 border-red-300 text-red-800",
};

const hasCamera = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

// Scanners in keyboard mode type the code and press Enter into whatever has focus, so this field
// keeps focus while the panel is open. On a phone or iPad the camera can read codes instead.
// `paused` closes the camera when the panel needs an answer on the page (e.g. linking a new code).
const ScanInput = ({ onScan, result, busy, hint, paused = false }) => {
  const { t } = useT();
  const ref = useRef(null);
  const [value, setValue] = useState("");
  const [camera, setCamera] = useState(false);

  useEffect(() => {
    if (!busy && !camera) ref.current?.focus();
  }, [busy, result, camera]);

  useEffect(() => {
    if (paused) setCamera(false);
  }, [paused]);

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
      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
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
          className="flex-1 min-w-0 border-2 border-third/40 focus:border-third rounded-2xl px-4 sm:px-5 py-4 text-lg sm:text-xl font-mono tracking-wider text-primary bg-white focus:outline-none focus:ring-4 focus:ring-third/15"
        />
        {hasCamera && (
          <button
            type="button"
            onClick={() => setCamera(true)}
            className="flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-4 rounded-2xl border-2 border-third/40 text-third font-semibold text-xs hover:border-third"
            aria-label={t("scan.camera")}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {t("scan.cameraShort")}
          </button>
        )}
      </form>
      {camera && (
        <CameraScanner
          onScan={(raw) => {
            const code = normalizeCode(raw);
            if (code) onScan(code);
          }}
          onClose={() => setCamera(false)}
          result={result}
        />
      )}
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
