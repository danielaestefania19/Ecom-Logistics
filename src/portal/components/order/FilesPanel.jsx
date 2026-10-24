import { useState } from "react";
import { useT } from "../../i18n";
import { openOrderFile, uploadOrderFile } from "../../lib/orders";
import { ErrorBanner } from "../ui";

const FilesPanel = ({ orderId, files, isStaff, onChanged }) => {
  const { t, fmtDateTime } = useT();
  const [kind, setKind] = useState("labels");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (e) => {
    const list = [...e.target.files];
    e.target.value = "";
    if (!list.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const f of list) await uploadOrderFile(orderId, f, isStaff ? kind : "labels");
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const open = async (path) => {
    try {
      await openOrderFile(path);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-3">
      {files.length === 0 && <p className="text-sm text-gray-400">{t("files.none")}</p>}
      <ul className="divide-y divide-gray-100">
        {files.map((f) => (
          <li key={f.id} className="py-2 flex items-center justify-between gap-3">
            <button type="button" onClick={() => open(f.storage_path)} className="text-sm text-third font-medium truncate text-left hover:underline">
              {f.file_name}
            </button>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {t(`files.kind.${f.kind}`)} · {fmtDateTime(f.created_at)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        {isStaff && (
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2">
            {["labels", "photo", "other"].map((k) => (
              <option key={k} value={k}>{t(`files.kind.${k}`)}</option>
            ))}
          </select>
        )}
        <label className={`cursor-pointer text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:border-third hover:text-third transition ${busy ? "opacity-50 pointer-events-none" : ""}`}>
          {busy ? t("files.uploading") : isStaff && kind === "photo" ? t("files.takePhoto") : t("files.upload")}
          <input
            type="file"
            multiple
            className="sr-only"
            accept={kind === "photo" ? "image/*" : "application/pdf,image/*"}
            capture={isStaff && kind === "photo" ? "environment" : undefined}
            onChange={upload}
          />
        </label>
      </div>
      {error && <ErrorBanner message={error} />}
    </div>
  );
};

export default FilesPanel;
