import React from 'react';
import Navbar from '../../home/Navbar';
import Header from './Header';
import Advantages from './Advantages';
import Pricing from './Pricing';
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
            <WhyChooseUs />
            <ContactUs />
            <FAQ />
            <Footer />  

        </div>
    );
};

export default AmazonPartner;
