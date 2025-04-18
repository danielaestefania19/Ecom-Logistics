import React from 'react';
import map from '../../assets/map.png'
import { Button } from "@heroui/react";

const CoverageMap = () => {
  return (
    <section className="bg-black text-white px-6 py-16 md:py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Mapa de fondo con puntos */}
        <div className="relative w-full md:w-1/2 mb-12 md:mb-0">
          <img
            src={map}
            alt="World Map"
            className="w-[110%] md:w-[110%] max-w-none  -ml-6 md:-ml-12"
          />

        </div>

         {/* Texto y botón */}
         <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="text-center md:text-left max-w-xl">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              <span className="text-white">Did you know?</span>
            </h2>

            <p className="text-white text-lg mb-4 leading-relaxed">
              Over <span className="text-third font-semibold">40% of U.S. imports</span> come through <span className="text-white font-bold opacity-90">California</span>, 
              home to the biggest brands and suppliers. That’s not just trivia, 
              <span className="text-third font-semibold"> it’s your business advantage!</span>
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed opacity-90">
              Welcome to <span className="text-white font-semibold">California</span>, the core of American logistics.
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed opacity-90">
              Right at the center is <span className="text-third font-bold">Ecom Logistics</span>.
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed opacity-90">
              📍 Based in the <span className="text-white font-semibold">Bay Area</span>, we’re exactly where commerce moves fastest — 
              closer to the ports, closer to suppliers, closer to success.
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed opacity-90">
              🚚 From pallet shipping to Amazon FBA prep and container deliveries, 
              <span className="text-third font-semibold"> we move your products faster and smarter.</span>
            </p>

            <p className="text-white text-lg mb-8 leading-relaxed opacity-70 italic">
              Stop guessing. Start growing.
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
