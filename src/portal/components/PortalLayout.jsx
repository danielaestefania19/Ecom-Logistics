import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useT } from "../i18n";

const icon = (d) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ICONS = {
  plus: icon(<path d="M12 5v14M5 12h14" />),
  box: icon(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" /></>),
  grid: icon(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>),
  card: icon(<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>),
  board: icon(<><rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="4" height="8" rx="1" /></>),
  truck: icon(<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />),
  calendar: icon(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  users: icon(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>),
  stack: icon(<><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></>),
  send: icon(<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />),
  list: icon(<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />),
  link: icon(<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />),
};

const CLIENT_NAV = [
  { to: "/portal/orders/new", key: "nav.newOrder", icon: "plus" },
  { to: "/portal/orders", key: "nav.myOrders", icon: "box", end: true },
  { to: "/portal/inventory", key: "nav.inventory", icon: "stack", only3pl: true },
  { to: "/portal/fulfillment", key: "nav.fulfillment", icon: "send", only3pl: true, end: true },
  { to: "/portal/amazon", key: "nav.amazon", icon: "link" },
  { to: "/portal/services", key: "nav.services", icon: "grid" },
  { to: "/portal/billing", key: "nav.billing", icon: "card" },
];

const STAFF_NAV = [
  { to: "/portal/ops", key: "nav.board", icon: "board", end: true },
  { to: "/portal/ops/arrivals", key: "nav.arrivals", icon: "truck" },
  { to: "/portal/ops/schedule", key: "nav.schedule", icon: "calendar" },
  { to: "/portal/orders", key: "nav.allOrders", icon: "box", end: true },
  { to: "/portal/orders/new", key: "nav.newOrder", icon: "plus" },
  { to: "/portal/amazon", key: "nav.amazon", icon: "link" },
  { to: "/portal/ops/amazon", key: "nav.amazonOps", icon: "link" },
];

const STAFF_3PL_NAV = [
  { to: "/portal/fulfillment", key: "nav.fulfillment", icon: "send", end: true },
  { to: "/portal/ops/picklist", key: "nav.pickList", icon: "list" },
  { to: "/portal/inventory", key: "nav.inventory", icon: "stack" },
];

const ADMIN_NAV = [{ to: "/portal/admin", key: "nav.clients", icon: "users" }];

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
    isActive ? "bg-third text-white" : "text-white/60 hover:text-white hover:bg-white/5"
  }`;

function NavSection({ title, items, onNavigate }) {
  const { t } = useT();
  return (
    <>
      {title && (
        <div className="pt-4 pb-1 px-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">{title}</span>
        </div>
      )}
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={linkCls}>
          {ICONS[item.icon]}
          {t(item.key)}
        </NavLink>
      ))}
    </>
  );
}

function SidebarContent({ onNavigate }) {
  const { user, clientProfile, role, signOut } = useAuth();
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const isStaff = role === "staff" || role === "admin";

  const displayName = clientProfile?.full_name || user?.email?.split("@")[0] || "—";
  const company = clientProfile?.company || "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-third text-[10px] font-bold uppercase tracking-widest block mb-0.5">
          {isStaff ? t("nav.opsPortal") : t("nav.clientPortal")}
        </span>
        <span className="text-white font-bold text-lg leading-tight">Ecom Logistics</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {isStaff ? (
          <>
            <NavSection title={t("nav.operations")} items={STAFF_NAV} onNavigate={onNavigate} />
            <NavSection title="3PL" items={STAFF_3PL_NAV} onNavigate={onNavigate} />
          </>
        ) : (
          <NavSection
            items={CLIENT_NAV.filter((i) => !i.only3pl || clientProfile?.services?.includes("3pl"))}
            onNavigate={onNavigate}
          />
        )}
        {role === "admin" && <NavSection title={t("nav.admin")} items={ADMIN_NAV} onNavigate={onNavigate} />}
      </nav>

      <div className="px-4 py-5 border-t border-white/10">
        <div className="flex items-center gap-1 mb-4 bg-white/5 rounded-lg p-1 w-fit" role="group" aria-label={t("nav.language")}>
          {["en", "es"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-xs font-bold px-3 py-1 rounded-md transition ${lang === l ? "bg-third text-white" : "text-white/50 hover:text-white"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-third/30 flex items-center justify-center text-third font-bold text-sm flex-shrink-0">
            {displayName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{displayName}</p>
            {company && <p className="text-white/40 text-xs truncate">{company}</p>}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg text-sm transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t("nav.signOut")}
        </button>
      </div>
    </div>
  );
}

const PortalLayout = ({ children }) => {
  const { t } = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="hidden md:flex md:flex-col w-60 bg-primary flex-shrink-0 sticky top-0 h-screen print:hidden">
        <SidebarContent />
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary flex flex-col transform transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full invisible"
        }`}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-primary px-4 py-3 flex items-center gap-3 flex-shrink-0 sticky top-0 z-20 print:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-white/70 hover:text-white" aria-label={t("nav.openMenu")}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-white font-semibold text-sm">Ecom Logistics</span>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default PortalLayout;
