import React from 'react';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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

    useEffect(() => {
        if (location.hash === "#local-moving") {
            const element = document.getElementById("local-moving");
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100); // pequeño delay para esperar el render
            }
        }
    }, [location]);

    return (

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
    );
};

export default AmazonPartner;
