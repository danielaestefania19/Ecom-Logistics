// Phase 3: Asana order status integration
// This page will fetch real-time order data from the Asana API via a Supabase Edge Function.
// For now it shows a preview of how the UI will look.

const SAMPLE_ORDERS = [
  { id: "1", name: "FBA Prep — 200 units ASIN B08XYZ", status: "In Progress", stage: 2, date: "Jul 1, 2026" },
  { id: "2", name: "3PL Fulfillment — TikTok Shop batch", status: "Ready to Ship", stage: 3, date: "Jun 28, 2026" },
  { id: "3", name: "FBA Prep — 450 units mixed SKU", status: "Shipped", stage: 4, date: "Jun 25, 2026" },
];

const STAGES = ["Received", "In Progress", "Ready to Ship", "Shipped"];

const stageBadge = {
  "Received":      "bg-gray-100 text-gray-600",
  "In Progress":   "bg-yellow-50 text-yellow-700",
  "Ready to Ship": "bg-blue-50 text-blue-700",
  "Shipped":       "bg-green-50 text-green-700",
};

const Orders = () => {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time status of your active and recent orders.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-full">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Live sync coming soon
        </span>
      </div>

      {/* Pipeline legend */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Pipeline</p>
        <div className="flex items-center gap-2 flex-wrap">
          {STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center gap-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${stageBadge[stage]}`}>
                {stage}
              </span>
              {i < STAGES.length - 1 && (
                <svg className="w-3 h-3 text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order list (sample data) */}
      <div className="space-y-3">
        {SAMPLE_ORDERS.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:border-third/40 transition"
          >
            <div className="min-w-0">
              <p className="text-primary font-medium text-sm truncate">{order.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">{order.date}</p>
            </div>
            <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${stageBadge[order.status]}`}>
              {order.status}
            </span>
          </div>
        ))}
      </div>

      {/* Coming soon callout */}
      <div className="mt-8 bg-primary rounded-2xl p-6 text-center">
        <p className="text-white font-semibold mb-1">Live Asana sync in progress</p>
        <p className="text-white/60 text-sm">
          Your real orders will appear here automatically once the Asana integration is activated.
          The layout and pipeline stages above reflect exactly how it will look.
        </p>
      </div>
    </div>
  );
};

export default Orders;
