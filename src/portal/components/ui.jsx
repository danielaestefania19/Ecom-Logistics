import { STAGE_STYLE, TRACKING_STYLE } from "../lib/orders";
import { useT } from "../i18n";

export const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-primary placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-third/30 focus:border-third transition disabled:bg-gray-50 disabled:text-gray-400";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 bg-primary hover:bg-third text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 hover:border-third hover:text-third font-semibold text-sm px-4 py-2.5 rounded-xl transition disabled:opacity-50";

export const Card = ({ title, action, children, className = "" }) => (
  <section className={`bg-white border border-gray-200 rounded-2xl ${className}`}>
    {(title || action) && (
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        {title && <h2 className="text-sm font-bold text-primary">{title}</h2>}
        {action}
      </div>
    )}
    <div className="p-5">{children}</div>
  </section>
);

export const Field = ({ label, hint, required, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-gray-500 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </span>
    {children}
    {hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
  </label>
);

export const StageBadge = ({ stage }) => {
  const { t } = useT();
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STAGE_STYLE[stage] ?? ""}`}>
      {t(`stage.${stage}`)}
    </span>
  );
};

export const TrackingBadge = ({ status }) => {
  const { t } = useT();
  return (
    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${TRACKING_STYLE[status] ?? TRACKING_STYLE.unknown}`}>
      {t(`tracking.status.${status}`)}
    </span>
  );
};

export const ErrorBanner = ({ message, onRetry }) => {
  const { t } = useT();
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm">
      <p className="flex-1 text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-semibold text-red-600 underline underline-offset-2">
          {t("common.retry")}
        </button>
      )}
    </div>
  );
};

export const Spinner = () => (
  <div className="py-16 grid place-items-center">
    <div className="w-7 h-7 border-2 border-third border-t-transparent rounded-full animate-spin" />
  </div>
);

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);
