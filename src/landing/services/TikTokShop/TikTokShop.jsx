import React from 'react';
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