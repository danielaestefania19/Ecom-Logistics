// ─── UPDATE THESE URLS with your real Asana form links ───────────────────────
const ASANA_FORMS = {
  fbaPrep: {
    url: "https://form.asana.com/?k=REPLACE_WITH_FBA_PREP_FORM_URL",
    title: "FBA Prep",
    subtitle: "Amazon FBA preparation & labeling",
    description:
      "Submit a new FBA prep order — FNSKU labeling, poly-bagging, bubble wrap, bundling, and full Amazon compliance.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    ),
    badge: "FBA",
  },
  fulfillment: {
    url: "https://form.asana.com/?k=REPLACE_WITH_3PL_FULFILLMENT_FORM_URL",
    title: "3PL Fulfillment",
    subtitle: "Pick, pack & ship orders",
    description:
      "Request pick & pack fulfillment for your Shopify, TikTok Shop, or Amazon orders. We handle storage, picking, packing, and outbound shipping.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      </svg>
    ),
    badge: "3PL",
  },
  freight: {
    url: "https://form.asana.com/?k=REPLACE_WITH_FREIGHT_FORM_URL",
    title: "Amazon Freight",
    subtitle: "LTL & FTL shipments to Amazon FC",
    description:
      "Book an LTL or FTL freight shipment to Amazon fulfillment centers. We handle scheduling, appointments, and BOL — all from Hayward, CA.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      </svg>
    ),
    badge: "Freight",
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const ServiceRequest = () => {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Request a Service</h1>
        <p className="text-gray-500 text-sm mt-1">
          Choose a service below to open your request form. Our team typically responds within a few hours.
        </p>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Object.values(ASANA_FORMS).map((svc) => (
          <div
            key={svc.title}
            className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:border-third/50 hover:shadow-md transition duration-200"
          >
            {/* Icon + badge */}
            <div className="flex items-start justify-between mb-4">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-third/10 text-third">
                {svc.icon}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-third bg-third/10 px-2.5 py-1 rounded-full">
                {svc.badge}
              </span>
            </div>

            {/* Text */}
            <h2 className="text-primary font-bold text-lg mb-0.5">{svc.title}</h2>
            <p className="text-third text-xs font-medium mb-3">{svc.subtitle}</p>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">{svc.description}</p>

            {/* CTA */}
            <a
              href={svc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-primary hover:bg-third text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition duration-200"
            >
              Open Request Form
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        ))}
      </div>

      {/* Help note */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-third flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <p className="text-gray-600 text-sm">
          Need help or have questions before submitting?{" "}
          <a href="tel:+13412089445" className="text-third font-medium hover:underline">
            Call us at +1 (341) 208-9445
          </a>{" "}
          or{" "}
          <a href="mailto:sales@ecomlogisticsus.com" className="text-third font-medium hover:underline">
            email sales@ecomlogisticsus.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default ServiceRequest;
