// Phase 4: Stripe invoices integration
// This page will fetch real invoices from Stripe via a Supabase Edge Function.

const SAMPLE_INVOICES = [
  { id: "inv_001", date: "Jul 1, 2026",  description: "FBA Prep — 200 units",          amount: "$180.00", status: "Paid" },
  { id: "inv_002", date: "Jun 15, 2026", description: "3PL Fulfillment — June batch",   amount: "$340.00", status: "Paid" },
  { id: "inv_003", date: "Jun 1, 2026",  description: "Storage — May 2026",             amount: "$95.00",  status: "Paid" },
  { id: "inv_004", date: "Jul 5, 2026",  description: "FBA Prep — 450 mixed units",     amount: "$405.00", status: "Due" },
];

const statusStyle = {
  Paid: "bg-green-50 text-green-700",
  Due:  "bg-yellow-50 text-yellow-700",
  Past: "bg-red-50 text-red-700",
};

const Billing = () => {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Billing</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and download your invoices.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-full">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Stripe sync coming soon
        </span>
      </div>

      {/* Invoice table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</span>
          <span className="col-span-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Description</span>
          <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</span>
          <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Status</span>
          <span className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">PDF</span>
        </div>

        {/* Rows */}
        {SAMPLE_INVOICES.map((inv) => (
          <div
            key={inv.id}
            className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition items-center"
          >
            <span className="col-span-2 text-sm text-gray-500">{inv.date}</span>
            <span className="col-span-5 text-sm text-primary font-medium">{inv.description}</span>
            <span className="col-span-2 text-sm font-bold text-primary text-right">{inv.amount}</span>
            <span className="col-span-2 flex justify-center">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[inv.status]}`}>
                {inv.status}
              </span>
            </span>
            <span className="col-span-1 flex justify-end">
              <button
                disabled
                title="PDF download available when Stripe is connected"
                className="text-gray-300 hover:text-third transition disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* Coming soon callout */}
      <div className="mt-8 bg-primary rounded-2xl p-6 text-center">
        <p className="text-white font-semibold mb-1">Stripe integration in progress</p>
        <p className="text-white/60 text-sm">
          Your real invoices and PDF download links will appear here once Stripe is connected.
          The layout above reflects exactly how it will look.
        </p>
      </div>
    </div>
  );
};

export default Billing;
