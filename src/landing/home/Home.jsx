import Hero from './Hero.jsx';
import Services from './Services.jsx';
import Discount from './Discount.jsx';
import VideoSection from './VideoSection.jsx';
import WhyEcom from './WhyEcom.jsx';
import ContactUs from './ContacUs.jsx';
import CustomerFeedback from './Feedback.jsx';
import CoverageMap from './CoverageMap.jsx';

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
      <Hero /> 
      <Services /> 
      <Discount/>
      <VideoSection/>
      <WhyEcom/>
      <ContactUs/>
      <CustomerFeedback/>
      <CoverageMap/>
    </>
  );
}

export default Home;
