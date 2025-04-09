import React from 'react';
import map from '../../assets/map.png'
import { Button } from "@heroui/react";

const CoverageMap = () => {
  return (
    <section className="bg-primary text-white px-6 py-16 md:py-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Mapa de fondo con puntos */}
        <div className="relative w-full md:w-1/2 mb-12 md:mb-0">
          <img
            src={map} // Cambia esto por la imagen del mapa con puntos
            alt="World Map"
            className="w-full opacity-70"
          />
          {/* Simulación de marcadores (ejemplo con Tailwind absolute) */}
          {/* Puedes repetir este div para cada marcador */}
          <div className="absolute top-[20%] left-[30%]">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
          </div>
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
           <Button
               radius="full"
               className="px-6 py-6 text-lg md:text-xl text-white bg-third hover:bg-white-100 font-semibold mt-8"
          >
           View coverage area
          </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageMap;
