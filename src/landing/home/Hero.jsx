import { Button } from "@heroui/react";
import ImageHero from "../../assets/ImageHero.avif";

const Hero = () => {
  return (
    <div className="relative w-full h-[70vh] flex flex-col md:flex-row text-white bg-[#070A0F] overflow-hidden">
      
{/* Texto */}
<div className="relative z-10 w-full md:w-1/2 p-8 
                md:pl-36 md:pr-10 
                lg:pl-48 lg:pr-20 
                xl:pl-60 xl:pr-28 
                md:py-24 font-montserrat flex-1 
md:flex md:flex-col md:justify-center md:items-start">


<h1 className="text-4xl md:text-6xl font-semibold mb-2">
  Logistics <span className="text-third">Solutions</span> for
</h1>
  <h1 className="text-4xl md:text-6xl font-semibold mb-9">E-Commerce Sellers</h1>

  <p className="text-xl md:text-3xl font-light w-full">
    Preparation, Warehousing, LTL, and 3PL
  </p>
  <p className="text-xl md:text-3xl font-light w-full mb-6">
    Center for Amazon FBA and TikTok Shop
  </p>

  <div className="flex gap-4 ml-4">
  <Button
    radius="full"
    className="px-6 py-6 text-lg  md:text-xl  text-white bg-third hover:bg-gray-100 font-semibold"
  >
    Get Started
  </Button>
  <Button
    radius="full"
    className="px-8 py-6 text-lg  md:text-xl  text-third bg-white hover:bg-gray-100 font-semibold"
  >
    Open App
  </Button>
</div>

</div>


      {/* Imagen en desktop con degradado (background) */}
      <div
        className="absolute top-0 right-0 h-full w-1/2 hidden md:block"
        style={{
          backgroundImage: `linear-gradient(to right, #070A0F 0%, rgba(7,10,15,0.8) 30%, rgba(7,10,15,0.4) 60%, transparent 100%), url(${ImageHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Imagen en mobile con overlay */}
      <div className="relative block md:hidden w-full h-1/2 flex-1">
        <img
          src={ImageHero}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        {/* Overlay con gradiente encima de la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-[#070A0F]/70 to-transparent" />
      </div>
    </div>
  );
};

export default Hero;
