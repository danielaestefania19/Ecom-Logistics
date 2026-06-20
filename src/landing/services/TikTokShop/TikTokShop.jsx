import React from 'react';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Seo from '../../seo/Seo';
import { buildServiceSchema } from '../../seo/siteData';
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
  const description =
    "Streamline your e-commerce with Ecom Logistics' 3PL services in Hayward, CA. Expert third-party fulfillment, warehousing & pick and pack for growing brands.";
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

  return (
    <>
      <Seo
        title="3PL Services | E-commerce Fulfillment & Warehousing in CA"
        description={description}
        path="/3pl-services"
        schema={buildServiceSchema({
          name: "3PL E-commerce Fulfillment Services",
          description,
          path: "/3pl-services",
        })}
      />
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