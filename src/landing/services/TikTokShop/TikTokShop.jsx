import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from '../../home/Navbar';
import Header from './Header';
import Advantages from './Advantages';
import Pricing from './Pricing';
import FreePackagingSection from './FreePackagingSection';
import Request from './Request';
import YouTubeSection from './YoutubeSection';
import FreeStorageOffer from './FreeStorageOffer';
import ContactUs from './ContacUs';
import FAQ from './FAQ';
import Footer from '../../home/Footer';


const TiktokShop = () => {
  const location = useLocation();
  useEffect(() => {
    document.title = "3PL Services | E-commerce Fulfillment & Logistics Solutions"
  }, []);
  useEffect(() => {
    if (location.hash === "#free-packaging") {
      const element = document.getElementById("free-packaging");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);
  <link rel="canonical" href="https://www.ecomlogisticsus.com/3pl-services"></link>

  return (
    <>
      <Helmet>
        <meta name="description" content="Streamline your e-commerce with Ecom Logistics' 3PL services. Expert third-party fulfillment, warehousing & pick and pack for growing brands."
        />
      </Helmet>
      <div>
        <Navbar />
        <Header />
        <Advantages />
        <Pricing />
        <Request />
        <YouTubeSection/>
        <FreePackagingSection />
        <FreeStorageOffer />
        <ContactUs />
        <FAQ />
        <Footer />
      </div>
    </>
  );
}

export default TiktokShop;