import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { LanguageProvider } from "../src/landing/i18n/LanguageContext.jsx";

// Landing pages
import Home          from "./landing/home/Home.jsx";
import AmazonPartner from "./landing/services/AmazonPartner/AmazonPartner.jsx";
import PrepCenter    from "./landing/services/PrepCenter/PrepCenter.jsx";
import TikTokShop    from "./landing/services/TikTokShop/TikTokShop.jsx";
import AboutUs       from "./landing/AboutUs/AboutUs.jsx";
import Pricing       from "./landing/pricing/Pricing.jsx";
import BlogPage      from "./landing/blog/BlogPage.jsx";
import BlogPost      from "./landing/blog/BlogPost.jsx";
import NotFound      from "./landing/NotFound.jsx";

// Client portal
import { AuthProvider, useAuth } from "./portal/AuthContext.jsx";
import { PortalI18nProvider } from "./portal/i18n.jsx";
import ProtectedRoute   from "./portal/ProtectedRoute.jsx";
import Login            from "./portal/pages/Login.jsx";
import SetPassword      from "./portal/pages/SetPassword.jsx";
import PortalLayout     from "./portal/components/PortalLayout.jsx";
import ServiceRequest   from "./portal/pages/ServiceRequest.jsx";
import Orders           from "./portal/pages/Orders.jsx";
import NewOrder         from "./portal/pages/NewOrder.jsx";
import OrderDetail      from "./portal/pages/OrderDetail.jsx";
import Billing          from "./portal/pages/Billing.jsx";
import Admin            from "./portal/pages/Admin.jsx";
import Board            from "./portal/pages/staff/Board.jsx";
import Schedule         from "./portal/pages/staff/Schedule.jsx";
import Arrivals         from "./portal/pages/staff/Arrivals.jsx";

const STAFF = ["staff", "admin"];

const LandingLayout = () => (
  <LanguageProvider>
    <Outlet />
  </LanguageProvider>
);

const PortalShell = () => (
  <PortalI18nProvider>
    <Outlet />
  </PortalI18nProvider>
);

const PortalPages = ({ Page, roles }) => (
  <ProtectedRoute roles={roles}>
    <PortalLayout>
      <Page />
    </PortalLayout>
  </ProtectedRoute>
);

const PortalHome = () => {
  const { role } = useAuth();
  return <Navigate to={STAFF.includes(role) ? "/portal/ops" : "/portal/orders"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/"                                element={<Navigate to="/home" />} />
          <Route path="/home"                            element={<Home />} />
          <Route path="/amazon-freight-partner-shipping" element={<AmazonPartner />} />
          <Route path="/prep-center"                     element={<PrepCenter />} />
          <Route path="/3pl-services"                    element={<TikTokShop />} />
          <Route path="/about-us"                        element={<AboutUs />} />
          <Route path="/pricing"                         element={<Pricing />} />
          <Route path="/blog"                            element={<BlogPage />} />
          <Route path="/blog/:slug"                      element={<BlogPost />} />
        </Route>

        <Route element={<PortalShell />}>
          <Route path="/portal/login"         element={<Login />} />
          <Route path="/portal/set-password"  element={<SetPassword />} />
          <Route path="/portal"               element={<ProtectedRoute><PortalHome /></ProtectedRoute>} />
          <Route path="/portal/services"      element={<PortalPages Page={ServiceRequest} />} />
          <Route path="/portal/orders"        element={<PortalPages Page={Orders} />} />
          <Route path="/portal/orders/new"    element={<PortalPages Page={NewOrder} />} />
          <Route path="/portal/orders/:id"    element={<PortalPages Page={OrderDetail} />} />
          <Route path="/portal/billing"       element={<PortalPages Page={Billing} />} />
          <Route path="/portal/ops"           element={<PortalPages Page={Board} roles={STAFF} />} />
          <Route path="/portal/ops/arrivals"  element={<PortalPages Page={Arrivals} roles={STAFF} />} />
          <Route path="/portal/ops/schedule"  element={<PortalPages Page={Schedule} roles={STAFF} />} />
          <Route path="/portal/admin"         element={<PortalPages Page={Admin} roles={["admin"]} />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
