import Navbar from '../home/Navbar.jsx';
import Seo from '../seo/Seo.jsx';
import { localBusinessSchema } from '../seo/siteData.js';
import WhyEcomLogistics from './WhyEcomLogistics.jsx';
import OurStory from './OurStory.jsx';
import WhatWeOffer from './WhatWeOffer.jsx';
import VideoSection from './VideoSection.jsx';
import SuccessSection from './SuccessSection.jsx';
import Footer from '../home/Footer.jsx';
import WhoWeAre from './WhoWeAre.jsx';
import ContactUs from './ContacUs.jsx';
import ContactInfo from './ContactInfo.jsx';
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
function AboutUs() {
    return (
        <>
            <Seo
                title="About Ecom Logistics | 3PL & FBA Prep Center in Hayward, CA"
                description="Discover Ecom Logistics: founded by e-commerce entrepreneurs. We offer scalable 3PL, FBA prep, and LTL/FTL shipping from Hayward, CA. Your reliable partner in growth."
                path="/about-us"
                schema={localBusinessSchema}
            />
            <Navbar />
            <VideoSection />
            <OurStory />
            <WhoWeAre />
            <WhatWeOffer />
            <WhyEcomLogistics />
            <SuccessSection />
            <ContactUs />
            <ContactInfo />
            <Footer />
        </>
    );
}

export default AboutUs;
