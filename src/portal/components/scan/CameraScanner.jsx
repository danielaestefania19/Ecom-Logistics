import { useEffect, useRef, useState } from "react";
import { useT } from "../../i18n";

const TONE = {
  ok: "bg-green-600",
  warn: "bg-amber-500",
  error: "bg-red-600",
};

// Safari on iPhone/iPad has no built-in barcode reader, so the camera reads codes with ZXing,
// loaded only when someone opens the camera.
const CameraScanner = ({ onScan, onClose, result }) => {
  const { t } = useT();
  const videoRef = useRef(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState(null);
  onScanRef.current = onScan;

  useEffect(() => {
    let controls;
    let stopped = false;
    // The camera sees a label many times a second. A code counts again only after it has been out
    // of view for a moment, so holding one unit in front of the camera counts it once.
    let last = { code: null, seenAt: 0 };

    (async () => {
      try {
        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
          import("@zxing/browser"),
          import("@zxing/library"),
        ]);
        const hints = new Map([
          [
            DecodeHintType.POSSIBLE_FORMATS,
            [BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.QR_CODE],
          ],
        ]);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 120 });
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          videoRef.current,
          (res) => {
            if (!res) return;
            const code = res.getText();
            const now = Date.now();
            const fresh = code !== last.code || now - last.seenAt > 1200;
            last = { code, seenAt: now };
            if (fresh) onScanRef.current(code);
          },
        );
        if (stopped) controls.stop();
      } catch (err) {
        if (!stopped) setError(err?.name === "NotAllowedError" ? t("scan.cameraDenied") : t("scan.cameraError"));
      }
    })();

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [t]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" role="dialog" aria-label={t("scan.camera")}>
      <div className="relative flex-1 min-h-0">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4/5 max-w-md h-36 border-4 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        </div>
        {error && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-5 text-center text-sm text-gray-800">{error}</div>
        )}
      </div>
      <div className="bg-black px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3">
        <p className="text-white/70 text-sm text-center">{t("scan.cameraHint")}</p>
        {result && (
          <div className={`${TONE[result.tone]} text-white rounded-xl px-4 py-3 text-base font-semibold text-center`} role="status" aria-live="polite">
            {result.text}
          </div>
        )}
        <button type="button" onClick={onClose} className="w-full bg-white text-primary font-bold text-base py-4 rounded-2xl">
          {t("scan.cameraClose")}
        </button>
      </div>
    </div>
  );
};

export default CameraScanner;
