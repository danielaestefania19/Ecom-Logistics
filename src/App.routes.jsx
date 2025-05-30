import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "../src/landing/i18n/LanguageContext.jsx";

import Home from "./landing/home/Home.jsx";
import AmazonPartner from "./landing/services/AmazonPartner/AmazonPartner.jsx";
import PrepCenter from "./landing/services/PrepCenter/PrepCenter.jsx";
import TikTokShop from "./landing/services/TikTokShop/TikTokShop.jsx";
import AboutUs from "./landing/AboutUs/AboutUs.jsx";
import NotFound from "./landing/NotFound.jsx";

/**
 * Main routing configuration for the application.
 * 
 * This sets up routing using semantic and language-independent URLs.
 * The visible text and navigation labels will still be translated via i18n.
 */
function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/amazon-partner" element={<AmazonPartner />} />
        <Route path="/prep-center" element={<PrepCenter />} />
        <Route path="/tiktok-shop" element={<TikTokShop />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
