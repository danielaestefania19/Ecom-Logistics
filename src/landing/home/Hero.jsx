import {
Button
  } from "@heroui/react";

const Hero = () => {
    return (
      <div className="bg-primary w-full top-10 text-white h-[70vh] flex items-center justify-start">
        <div className="relative z-10 text-left w-1/2 p-24 font-montserrat">
          <h1 className="text-6xl font-bold mb-2">Logistics Solutions for</h1>
          <h1 className="text-6xl font-extrabold mb-4">E-Commerce Sellers</h1>
          
          <p className="text-lg font-light">
            Preparation, Warehousing, LTL, and 3PL
          </p>
          <p className="text-lg font-medium">
            Center for Amazon FBA and TikTok Shop
          </p>
        </div>
        <Button radius="lg">Large</Button>
      </div>
    );
  };
  
  export default Hero;
  