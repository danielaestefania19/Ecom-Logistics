import React from 'react';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Seo from '../../seo/Seo';
import { buildServiceSchema, buildFaqSchema } from '../../seo/siteData';
import { useLanguage } from '../../i18n/LanguageContext';
import Navbar from '../../home/Navbar';
import Header from './Header';
import Advantages from './Advantages';
import Request from './Request';
import Pricing from './Pricing';
import CoverageMap from './CoverageMap';
import WhyChooseUs from './WhyChooseUs';
import ContactUs from '../../home/ContacUs';
import FAQ from './FAQ';
import Footer from '../../home/Footer';
import LocalMoving from './ LocalMoving';

const AmazonPartner = () => {
    const location = useLocation();
    const { t } = useLanguage();
    const faqItems = t("faq.questions", { returnObjects: true });
    const description =
        "Streamline your LTL & FTL shipments with Ecom Logistics. As an Amazon Freight Partner in Hayward, CA, we offer efficient, cost-effective freight to Amazon FBA warehouses and beyond.";
    useEffect(() => {
        if (location.hash === "#local-moving") {
            const element = document.getElementById("local-moving");
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
                title="Amazon Freight Partner | LTL & FTL Shipping | Ecom Logistics"
                description={description}
                path="/amazon-freight-partner-shipping"
                schema={[
                    buildServiceSchema({
                        name: "Amazon Freight Partner LTL & FTL Shipping",
                        description,
                        path: "/amazon-freight-partner-shipping",
                    }),
                    buildFaqSchema(faqItems),
                ].filter(Boolean)}
            />

            <div className="bg-white text-gray-800">
                <Navbar />
                <Header />
                <Advantages />
                <Pricing />
                <Request />
                <CoverageMap />
                <WhyChooseUs />
                <LocalMoving />
                <ContactUs />
                <FAQ />
                <Footer />
            </div>
        </>
    );

};

export default AmazonPartner;
