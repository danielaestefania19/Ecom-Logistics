import React from 'react';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from '../../home/Navbar';
import Header from './Header';
import Advantages from './Advantages';
import Pricing from './Pricing';
import FreePackagingSection from './FreePackagingSection';
import Request from './Request';
import FreeStorageOffer from './FreeStorageOffer';
import ContactUs from './ContacUs';
import FAQ from './FAQ';
import Footer from '../../home/Footer';


const TiktokShop = () => {  
    const location = useLocation();

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
        <div>
            <Navbar />
            <Header />
            <Advantages />
            <Pricing />
            <Request />
            <FreePackagingSection/>
            <FreeStorageOffer />
            <ContactUs />
            <FAQ />
            <Footer />  

        </div>
    );
}

export default TiktokShop;