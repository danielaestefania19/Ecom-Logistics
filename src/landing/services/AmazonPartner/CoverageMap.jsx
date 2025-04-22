import React from 'react';
import map1 from '../../../assets/map1.jpg';
import { Button } from "@heroui/react";

const CoverageMap = () => {
  return (
    <section className="bg-black text-white px-6 py-16 md:py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Mapa de fondo con puntos */}
        <div className="relative w-full md:w-1/2 mb-12 md:mb-0">
          <img
            src={map1}
            alt="World Map"
            className="w-[110%] md:w-[110%] max-w-none -ml-6 md:-ml-12"
          />
        </div>

        {/* Texto y botón */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="text-center md:text-left max-w-xl">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              <span className="text-white">Our Amazon Partner Carrier Coverage</span>
            </h2>

            <p className="text-white text-lg mb-4 leading-relaxed">
              At <span className="text-third font-semibold">Ecom Logistics</span>, we team up with Amazon’s trusted carrier network
              to bring you fast, on-time deliveries nationwide 🚚🌎.
              From coast to coast, our optimized shipping solutions ensure your products
              reach customers and fulfillment centers quickly, cost-effectively,
              and with full FBA compliance 📦✅.
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed">
              Track your shipments in real-time 📍 and enjoy personalized support at every step.
              Ready to see how far we go? Check out the map below to explore the locations we service.
            </p>

            <p className="text-white text-lg mb-8 leading-relaxed opacity-90 font-semibold italic">
              Don’t see your preferred warehouse? <br />
              <span className="not-italic font-normal">No worries! Simply contact us and ask about the location you have in mind! 📞</span>
            </p>

            <a href="#contact">
              <Button
                radius="full"
                className="px-8 py-6 text-base md:text-lg text-white bg-third hover:opacity-90 transition font-semibold shadow-lg"
              >
                Contact us today
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageMap;
