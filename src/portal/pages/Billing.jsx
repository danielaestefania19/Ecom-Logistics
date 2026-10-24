import { useCallback, useEffect, useState } from "react";
import { useT } from "../i18n";
import { callFunction } from "../lib/orders";
import { btnSecondary, ErrorBanner, PageHeader, Spinner } from "../components/ui";

const STATUS_STYLE = {
  paid: "bg-green-50 text-green-700 border border-green-200",
  open: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  draft: "bg-gray-100 text-gray-500",
  uncollectible: "bg-red-50 text-red-600 border border-red-200",
  void: "bg-gray-100 text-gray-400",
};

const Billing = () => {
  const { t, locale, fmtDate } = useT();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const money = (cents, currency = "usd") =>
    cents == null ? "—" : new Intl.NumberFormat(locale, { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callFunction("stripe-invoices", {});
      setInvoices(data?.invoices ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const usd = invoices.filter((i) => i.currency === "usd");
  const totalPaid = usd.filter((i) => i.status === "paid").reduce((s, i) => s + (i.amountPaid ?? 0), 0);
  const totalDue = usd.filter((i) => i.status === "open").reduce((s, i) => s + (i.amountDue ?? 0), 0);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={t("billing.title")}
        subtitle={t("billing.subtitle")}
        action={<button onClick={load} disabled={loading} className={btnSecondary}>{t("common.refresh")}</button>}
      />

      {loading && <Spinner />}
      {!loading && error && <ErrorBanner message={error} onRetry={load} />}
      {!loading && !error && invoices.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-14 text-center">
          <p className="text-primary font-semibold mb-1">{t("billing.empty")}</p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">{t("billing.emptyHint")}</p>
        </div>
      )}

      {!loading && !error && invoices.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              [t("billing.count"), invoices.length, "text-primary"],
              [t("billing.paid"), money(totalPaid), "text-green-700"],
              [t("billing.due"), money(totalDue), totalDue > 0 ? "text-yellow-700" : "text-primary"],
            ].map(([label, value, cls]) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
                <p className={`text-xl font-bold ${cls}`}>{value}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-3">
            {invoices.map((inv) => (
              <li key={inv.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{inv.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmtDate(inv.created * 1000)} · <span className="font-mono">{inv.number ?? "—"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    {money(inv.status === "paid" ? inv.amountPaid : inv.amountDue, inv.currency)}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[inv.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {t(`billing.status.${inv.status}`)}
                  </span>
                  {inv.status === "open" && inv.hostedUrl && (
                    <a href={inv.hostedUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white bg-yellow-600 hover:bg-yellow-700 px-3 py-1.5 rounded-lg">
                      {t("billing.payNow")}
                    </a>
                  )}
                  {inv.pdfUrl && (
                    <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-third hover:underline">
                      PDF
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Billing;
