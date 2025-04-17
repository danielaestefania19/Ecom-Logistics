import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './landing/home/Home.jsx';
import Navbar from './landing/home/Navbar.jsx';
import Footer from './landing/home/Footer.jsx';
import NotFound from './landing/NotFound.jsx'; 
import AmazonPartner from './landing/services/AmazonPartner/AmazonPartner.jsx'; 


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
        <Route path="/home" element={<><Navbar /><Home /></>} />
        <Route path="/Amazon Partner" element={<> <AmazonPartner /></>}/> 
        <Route path="*" element={<NotFound />} /> 
      </Routes>
    </div>
  );
}

export default App;

