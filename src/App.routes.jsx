import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './landing/home/Home.jsx';
import AmazonPartner from './landing/services/AmazonPartner/AmazonPartner.jsx';
import PrepCenter from './landing/services/PrepCenter/PrepCenter.jsx';
import TikTokShop from './landing/services/TikTokShop/TikTokShop.jsx';
import AboutUs from './landing/AboutUs/AboutUs.jsx';
import NotFound from './landing/NotFound.jsx';
/**
 * Main routing configuration for the application.
 * 
 * This sets up the routing so that the `Home` component is rendered when 
 * the user navigates to the `/home` path.
 * 
 * @component
 * @returns {JSX.Element} The routing configuration with the `Home` route.
 */
function App() {
  return (
    <div>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Amazon Partner" element={<AmazonPartner />} />
          <Route path="/prepservices" element={<PrepCenter />} />
          <Route path="/TikTok" element={<TikTokShop />} />
          <Route path='/aboutus' element={<AboutUs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
    </div>
  );
}

export default App;

