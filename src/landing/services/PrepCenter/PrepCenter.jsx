import React from 'react';
import Navbar from '../../home/Navbar';
import Header from './Header';
import Advantages from './Advantages';
import Footer from '../../home/Footer';
import Pricing from './Pricing';
import Request from './Request';
import FAQ from './FAQ';
import ContactUs from '../../home/ContacUs';
import VideoSection from './VideoSection';

const PrepCenter = () => {
    return (
        <div className="bg-white text-gray-800">
            <Navbar />
            <Header />
            <Advantages />
            <Pricing />
            <Request />
            <VideoSection/>
            <ContactUs />
            <FAQ />
            <Footer />

        </div>
    );
};

export default PrepCenter;
