import Navbar from '../home/Navbar.jsx';
import { Helmet } from 'react-helmet-async';
import { useEffect } from "react";
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
    useEffect(() => {
        document.title = "About Ecom Logistics | Premier 3PL & Prep Center for E-commerce"
    }, []);
    return (
        <>
            <Helmet>
                <link rel="canonical" href="https://www.ecomlogisticsus.com/about-us"></link>
                <meta name="description" content="Discover Ecom Logistics: founded by e-commerce entrepreneurs. We offer scalable 3PL, FBA prep, and LTL shipping from Hayward, CA. Your reliable partner in growth."
                />
            </Helmet>
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
