import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../AuthContext";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatAmount(cents, currency = "usd") {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(unix) {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// Map Stripe status → { label, style }
const STATUS_CONFIG = {
  paid:           { label: "Paid",         style: "bg-green-50 text-green-700 border border-green-200" },
  open:           { label: "Due",          style: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  draft:          { label: "Draft",        style: "bg-gray-100 text-gray-500" },
  uncollectible:  { label: "Uncollectible",style: "bg-red-50 text-red-600 border border-red-200" },
  void:           { label: "Void",         style: "bg-gray-100 text-gray-400" },
};

// ─── Sub-components ────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* header */}
      <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
        {["col-span-2","col-span-4","col-span-2","col-span-2","col-span-1","col-span-1"].map((c, i) => (
          <div key={i} className={`${c} h-3 bg-gray-200 rounded animate-pulse`} />
        ))}
      </div>
      {[1,2,3].map((i) => (
        <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-100 last:border-0 animate-pulse items-center">
          <div className="col-span-2 h-3.5 bg-gray-100 rounded" />
          <div className="col-span-4 h-3.5 bg-gray-100 rounded" />
          <div className="col-span-2 h-3.5 bg-gray-100 rounded ml-auto" />
          <div className="col-span-2 h-6 bg-gray-100 rounded-full w-16 mx-auto" />
          <div className="col-span-1 h-4 w-4 bg-gray-100 rounded mx-auto" />
          <div className="col-span-1 h-4 w-4 bg-gray-100 rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-14 text-center">
      <div className="grid place-items-center w-14 h-14 rounded-2xl bg-third/10 mx-auto mb-4">
        <svg className="w-7 h-7 text-third" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <p className="text-primary font-semibold mb-1">No invoices yet</p>
      <p className="text-gray-400 text-sm max-w-xs mx-auto">
        Your Stripe invoices will appear here automatically once they are issued.
      </p>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-red-700 font-medium text-sm">Could not load invoices</p>
        <p className="text-red-500 text-xs mt-0.5">{message}</p>
      </div>
      <button onClick={onRetry} className="text-xs font-semibold text-red-600 hover:text-red-800 flex-shrink-0 underline underline-offset-2">
        Retry
      </button>
    </div>
  );
}

function SummaryCard({ invoices }) {
  const paid  = invoices.filter(i => i.status === "paid");
  const due   = invoices.filter(i => i.status === "open");
  const totalPaid = paid.reduce((s, i) => s + (i.amountPaid ?? 0), 0);
  const totalDue  = due.reduce((s, i)  => s + (i.amountDue  ?? 0), 0);

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[
        { label: "Total Invoices", value: invoices.length, suffix: "" },
        { label: "Total Paid",     value: formatAmount(totalPaid), suffix: "", green: true },
        { label: "Amount Due",     value: formatAmount(totalDue),  suffix: "", yellow: totalDue > 0 },
      ].map(({ label, value, green, yellow }) => (
        <div key={label} className={`bg-white border rounded-xl px-5 py-4 ${green ? "border-green-200" : yellow ? "border-yellow-200" : "border-gray-200"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
          <p className={`text-xl font-bold ${green ? "text-green-700" : yellow ? "text-yellow-700" : "text-primary"}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
const Billing = () => {
  const { session } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": supabaseAnon,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      if (data?.error) throw new Error(data.error);

      setInvoices(data?.invoices ?? []);
    } catch (err) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token) fetchInvoices();
  }, [fetchInvoices, session]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Billing</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and download your Stripe invoices.
          </p>
        </div>
        <button
          onClick={fetchInvoices}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-third border border-third/30 hover:bg-third/5 px-3 py-1.5 rounded-full transition disabled:opacity-40"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Content */}
      {loading && <LoadingSkeleton />}

      {!loading && error && <ErrorBanner message={error} onRetry={fetchInvoices} />}

      {!loading && !error && invoices.length === 0 && <EmptyState />}

      {!loading && !error && invoices.length > 0 && (
        <>
          <SummaryCard invoices={invoices} />

          {/* Invoice table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</span>
              <span className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">#</span>
              <span className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Description</span>
              <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</span>
              <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Status</span>
              <span className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">PDF</span>
            </div>

            {/* Rows */}
            {invoices.map((inv) => {
              const cfg = STATUS_CONFIG[inv.status] ?? { label: inv.status, style: "bg-gray-100 text-gray-500" };
              return (
                <div
                  key={inv.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition items-center"
                >
                  <span className="col-span-2 text-sm text-gray-500">{formatDate(inv.created)}</span>
                  <span className="col-span-1 text-xs text-gray-400 font-mono">{inv.number ?? "—"}</span>
                  <span className="col-span-4 text-sm text-primary font-medium truncate" title={inv.description}>
                    {inv.description}
                  </span>
                  <span className="col-span-2 text-sm font-bold text-primary text-right">
                    {formatAmount(inv.amountDue, inv.currency)}
                  </span>
                  <span className="col-span-2 flex justify-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.style}`}>
                      {cfg.label}
                    </span>
                  </span>
                  <span className="col-span-1 flex justify-center">
                    {inv.pdfUrl ? (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download PDF"
                        className="text-third hover:text-primary transition"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-gray-300">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pay open invoices nudge */}
          {invoices.some(i => i.status === "open" && i.hostedUrl) && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
                <p className="text-yellow-800 text-sm font-medium">You have unpaid invoices.</p>
              </div>
              {invoices.find(i => i.status === "open" && i.hostedUrl) && (
                <a
                  href={invoices.find(i => i.status === "open" && i.hostedUrl).hostedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-xs font-bold text-white bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition"
                >
                  Pay now
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Billing;
