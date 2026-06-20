import React from 'react';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Seo from '../../seo/Seo';
import { buildServiceSchema, buildFaqSchema } from '../../seo/siteData';
import { useLanguage } from '../../i18n/LanguageContext';
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
  const { t } = useLanguage();
  const faqItems = t("faqTiktok.questions", { returnObjects: true });
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
        title="Amazon 3PL & E-commerce Fulfillment | Pick & Pack | Ecom Logistics"
        description={description}
        path="/3pl-services"
        schema={[
          buildServiceSchema({
            name: "3PL E-commerce Fulfillment Services",
            description,
            path: "/3pl-services",
          }),
          buildFaqSchema(faqItems),
        ].filter(Boolean)}
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