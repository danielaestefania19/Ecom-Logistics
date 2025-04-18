import React from 'react';
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

const AmazonPartner = () => {
    return (
        <div className="bg-white text-gray-800">
            <Navbar />
            <Header />
            <Advantages />
            <Pricing />
            <Request />
            <CoverageMap />
            <WhyChooseUs />
            <ContactUs />
            <FAQ />
            <Footer />  

        </div>
    );
};

export default AmazonPartner;
