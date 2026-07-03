import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";

// ─── Stage config ──────────────────────────────────────────────────────────────
// Map Asana section names (or Estado del Cliente values) → normalized UI stages
const STAGES = ["Received", "In Progress", "Ready to Ship", "Shipped"];

const STAGE_BADGE = {
  "Received":      "bg-gray-100 text-gray-600",
  "In Progress":   "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "Ready to Ship": "bg-blue-50 text-blue-700 border border-blue-200",
  "Shipped":       "bg-green-50 text-green-700 border border-green-200",
  "Completed":     "bg-green-50 text-green-700 border border-green-200",
  "Cancelled":     "bg-red-50 text-red-600 border border-red-200",
};

const STAGE_DOT = {
  "Received":      "bg-gray-400",
  "In Progress":   "bg-yellow-400",
  "Ready to Ship": "bg-blue-500",
  "Shipped":       "bg-green-500",
  "Completed":     "bg-green-500",
  "Cancelled":     "bg-red-400",
};

// Convert an Asana task returned by the edge function → display-ready order
function parseOrder(task) {
  const fields = task.fields || {};

  // Derive the status to display — prefer "Estado del Cliente", fall back to section name
  const rawStatus =
    fields["Estado del Cliente"] ||
    fields["Type"] ||
    task.currentSection ||
    "Received";

  // Map Spanish / internal values → normalized English stages
  const STATUS_MAP = {
    "Recibido":          "Received",
    "En proceso":        "In Progress",
    "En Proceso":        "In Progress",
    "Listo para enviar": "Ready to Ship",
    "Listo Para Enviar": "Ready to Ship",
    "Enviado":           "Shipped",
    "Completado":        "Shipped",
    "Cancelado":         "Cancelled",
    // Section-name fallbacks (English labels if you use them)
    "Received":          "Received",
    "In Progress":       "In Progress",
    "Ready to Ship":     "Ready to Ship",
    "Shipped":           "Shipped",
  };

  const status = STATUS_MAP[rawStatus] || rawStatus;

  // Format the date
  const rawDate = task.modifiedAt || task.createdAt;
  const date = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return {
    id: task.id,
    name: task.name,
    status,
    date,
    completed: task.completed,
    projectName: task.currentProject,
    type: fields["Type"] || null,
    totalBilled: fields["Total facturado"] || null,
    billingStatus: fields["Billing Status"] || null,
    invoiceNum: fields["Nro de factura:"] || null,
    ltlStatus: fields["LTL Status"] || null,
  };
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl px-5 py-4 animate-pulse">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded-full flex-shrink-0" />
          </div>
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
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      </div>
      <p className="text-primary font-semibold mb-1">No orders yet</p>
      <p className="text-gray-400 text-sm max-w-xs mx-auto">
        Once you submit a service request, your order status will appear here automatically.
      </p>
      <a
        href="/portal/services"
        className="mt-5 inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-third transition duration-200"
      >
        Request a service
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-red-700 font-medium text-sm">Could not load orders</p>
        <p className="text-red-500 text-xs mt-0.5">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="text-xs font-semibold text-red-600 hover:text-red-800 flex-shrink-0 underline underline-offset-2"
      >
        Retry
      </button>
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const badge = STAGE_BADGE[order.status] || "bg-gray-100 text-gray-600";
  const dot   = STAGE_DOT[order.status]  || "bg-gray-400";

  // Extra metadata to show when expanded
  const extras = [
    order.type          && { label: "Type",            value: order.type },
    order.ltlStatus     && { label: "LTL Status",      value: order.ltlStatus },
    order.billingStatus && { label: "Billing Status",  value: order.billingStatus },
    order.invoiceNum    && { label: "Invoice #",        value: order.invoiceNum },
    order.totalBilled   && { label: "Total Billed",    value: order.totalBilled },
    order.projectName   && { label: "Project",         value: order.projectName },
  ].filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-third/40 transition">
      {/* Main row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`flex-shrink-0 w-2 h-2 rounded-full ${dot}`} />
          <div className="min-w-0">
            <p className="text-primary font-medium text-sm truncate">{order.name}</p>
            <p className="text-gray-400 text-xs mt-0.5">{order.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge}`}>
            {order.status}
          </span>
          {extras.length > 0 && (
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && extras.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
          {extras.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className="text-xs font-medium text-primary mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
const Orders = () => {
  const { session } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("asana-orders", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (fnError) throw new Error(fnError.message || "Edge function error");
      if (data?.error) throw new Error(data.error);

      const tasks = data?.orders ?? [];
      setOrders(tasks.map(parseOrder));
    } catch (err) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token) fetchOrders();
  }, [fetchOrders, session]);

  // Split into active vs completed
  const active    = orders.filter((o) => !o.completed);
  const completed = orders.filter((o) => o.completed);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time status of your active and recent orders from Asana.
          </p>
        </div>
        <button
          onClick={fetchOrders}
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

      {/* Pipeline legend */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Pipeline</p>
        <div className="flex items-center gap-2 flex-wrap">
          {STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center gap-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${STAGE_BADGE[stage]}`}>
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

      {/* Content */}
      {loading && <LoadingSkeleton />}

      {!loading && error && <ErrorBanner message={error} onRetry={fetchOrders} />}

      {!loading && !error && orders.length === 0 && <EmptyState />}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-6">
          {/* Active orders */}
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Active ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}

          {/* Completed orders */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Completed ({completed.length})
              </h2>
              <div className="space-y-3 opacity-70">
                {completed.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
