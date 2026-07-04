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
import { AuthProvider } from "./portal/AuthContext.jsx";
import ProtectedRoute   from "./portal/ProtectedRoute.jsx";
import Login            from "./portal/pages/Login.jsx";
import SetPassword      from "./portal/pages/SetPassword.jsx";
import PortalLayout     from "./portal/components/PortalLayout.jsx";
import ServiceRequest   from "./portal/pages/ServiceRequest.jsx";
import Orders           from "./portal/pages/Orders.jsx";
import Billing          from "./portal/pages/Billing.jsx";
import Admin            from "./portal/pages/Admin.jsx";

// Layout wrapper that provides i18n to all landing pages
const LandingLayout = () => (
  <LanguageProvider>
    <Outlet />
  </LanguageProvider>
);

// Layout wrapper for protected portal pages
const PortalPages = ({ Page }) => (
  <ProtectedRoute>
    <PortalLayout>
      <Page />
    </PortalLayout>
  </ProtectedRoute>
);

/**
 * Main routing configuration.
 * - Landing routes: wrapped in LanguageProvider (EN/ES i18n)
 * - Portal routes (/portal/*): protected by Supabase Auth, no i18n needed
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Landing pages (i18n) ── */}
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

        {/* ── Client portal ── */}
        <Route path="/portal/login"       element={<Login />} />
        <Route path="/portal/set-password" element={<SetPassword />} />
        <Route path="/portal"          element={<Navigate to="/portal/services" replace />} />
        <Route path="/portal/services" element={<PortalPages Page={ServiceRequest} />} />
        <Route path="/portal/orders"   element={<PortalPages Page={Orders} />} />
        <Route path="/portal/billing"  element={<PortalPages Page={Billing} />} />
        <Route path="/portal/admin"   element={<PortalPages Page={Admin} />} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
