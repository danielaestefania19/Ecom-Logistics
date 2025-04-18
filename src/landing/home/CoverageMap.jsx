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
          <div className="text-center md:text-left max-w-md">
            <h2 className="text-4xl font-semibold mb-4 leading-tight">
              Our service <span className="text-third">reaches</span><br />
              everywhere!
            </h2>
            <p className="text-white mb-6">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor velit officia est do
              amet sint. Velit officia duis enim do amet sint.
            </p>
            <a href="#contact">
              <Button
                radius="full"
                className="px-6 py-6 text-lg md:text-xl text-white bg-third hover:bg-white-100 font-semibold mt-8"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageMap;
