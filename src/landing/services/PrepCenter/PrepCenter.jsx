import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import Navbar from '../../home/Navbar';
import Header from './Header';
import Advantages from './Advantages';
import Footer from '../../home/Footer';
import Pricing from './Pricing';
import Request from './Request';
import FAQ from './FAQ';
import ContactUs from '../../home/ContacUs';
import FreeStorageOffer from './FreeStorageOffer';
import VideoSection from './VideoSection';

const PrepCenter = () => {
    useEffect(() => {
        document.title = "Amazon FBA Prep Center | Top Rated Prep center in California"
    }, []);
    return (
        <>
            <Helmet>
                <link rel="canonical" href="https://www.ecomlogisticsus.com/prep-center"></link>
                <meta
                    name="description"
                    content="Ecom Logistics is your Amazon FBA Prep Center in Hayward, CA. We offer expert inspection, FNSKU labeling, efficient packaging, and direct shipping to Amazon. Optimize your FBA prep!"
                />
            </Helmet>
            <div className="bg-white text-gray-800">
                <Navbar />
                <Header />
                <Advantages />
                <Pricing />
                <Request />
                <FreeStorageOffer />
                <VideoSection />
                <ContactUs />
                <FAQ />
                <Footer />

            </div>
        </>
    );
};

export default PrepCenter;
