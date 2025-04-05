import { Button } from "@heroui/react";
import ImageHero from "../../assets/ImageHero.avif"; // reemplaza con tu imagen

const Hero = () => {
  return (
    <div className="relative h-[70vh] w-full flex items-center text-white bg-[#070A0F] overflow-hidden">
      
      {/* Texto a la izquierda */}
      <div className="relative z-10 w-full md:w-1/2 p-8 md:p-24 font-montserrat">
        <h1 className="text-4xl md:text-6xl font-bold mb-2">Logistics Solutions for</h1>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">E-Commerce Sellers</h1>

        <p className="text-md md:text-lg font-light">
          Preparation, Warehousing, LTL, and 3PL
        </p>
        <p className="text-md md:text-lg font-medium">
          Center for Amazon FBA and TikTok Shop
        </p>

        <Button
          radius="lg"
          className="mt-6 text-[#070A0F] bg-white hover:bg-gray-100 font-semibold"
        >
          Get Started
        </Button>
      </div>

      {/* Imagen de fondo con difuminado - visible solo en md+ */}
      <div
        className="absolute top-0 right-0 h-full w-1/2 hidden md:block"
        style={{
          backgroundImage: `linear-gradient(to right, #070A0F 0%, rgba(7,10,15,0.8) 30%, rgba(7,10,15,0.4) 60%, transparent 100%), url(${ImageHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};

export default Hero;
