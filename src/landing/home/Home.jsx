import Navbar from './Navbar.jsx';
//import Hero from './Hero.jsx';
import Banner from './Banner.jsx';

/**
 * Main component for the homepage.
 * 
 * This component renders the `Navbar` and the `Hero` on the user interface.
 * The `Navbar` generally contains the application's navigation bar,
 * while the `Hero` is a prominent section at the top of the page.
 * 
 * @component
 * @returns {JSX.Element} The `Home` component containing the `Navbar` and `Hero`.
 */
function Home() {
  return (
    <>
      <Banner/>
      <Navbar />
      {/* <Hero /> */}
    </>
  );
}

export default Home;
