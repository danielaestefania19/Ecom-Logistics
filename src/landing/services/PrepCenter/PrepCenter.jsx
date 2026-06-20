import React from 'react';
import Seo from '../../seo/Seo';
import { buildServiceSchema } from '../../seo/siteData';
import Navbar from '../../home/Navbar';
import Header from './Header';
import Advantages from './Advantages';
import Footer from '../../home/Footer';
import Pricing from './Pricing';
import Request from './Request';
import YoutubeSection from './YouTubeSection'
import FAQ from './FAQ';
import ContactUs from '../../home/ContacUs';
import FreeStorageOffer from './FreeStorageOffer';
import VideoSection from './VideoSection';

const PrepCenter = () => {
    const description =
        "Ecom Logistics is your Amazon FBA Prep Center in Hayward, CA. We offer expert inspection, FNSKU labeling, efficient packaging, and direct shipping to Amazon. Optimize your FBA prep!";
    return (
        <>
            <Seo
                title="Amazon FBA Prep Center in Hayward, CA | Ecom Logistics"
                description={description}
                path="/prep-center"
                type="website"
                schema={buildServiceSchema({
                    name: "Amazon FBA Prep Center",
                    description,
                    path: "/prep-center",
                })}
            />
            <div className="bg-white text-gray-800">
                <Navbar />
                <Header />
                <Advantages />
                <Pricing />
                <Request />
                <YoutubeSection/>
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
