import { Routes, Route } from 'react-router-dom';
import Home from './landing/home/Home';

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
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
