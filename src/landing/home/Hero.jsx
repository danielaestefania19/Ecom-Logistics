import { Button } from "@heroui/react";
import ImageHero from "../../assets/ImageHero.jpg";

const Hero = () => {
  return (
    <div className="relative w-full min-h-[70vh] flex flex-col md:flex-row text-white bg-primary overflow-hidden">
      <div
        className="relative z-10 w-full md:w-1/2 p-8 md:pl-28 md:pr-10 lg:pl-36 lg:pr-20 xl:pl-48 xl:pr-28 md:py-24 font-montserrat flex-1 md:flex md:flex-col md:justify-center md:items-start text-center md:text-left"
      >
        <h1 className="text-4xl md:text-6xl font-semibold mb-2">
          Logistics <span className="text-third">Solutions</span> for
        </h1>
        <h1 className="text-4xl md:text-6xl font-semibold mb-9">
          E-Commerce Sellers
        </h1>

        <p className="text-xl sm:text-base md:text-3xl font-light w-full mb-4 sm:mb-2">
        Prep Center, Amazon Partner Currier (LTL & FTL), 
        </p>
        <p className="text-xl sm:text-base md:text-3xl font-light w-full mb-4 sm:mb-2">
        3PL fulfillment for Amazon and TikTok Shop.
        </p>
        <div  className="flex gap-4 justify-center md:justify-start">
        <a href="#contact">
          <Button
            radius="full"
            className="px-6 py-6 text-lg md:text-xl text-white bg-third hover:bg-white-100 font-semibold mt-8"
          >
            Get Started
          </Button>
          </a>
          <Button
            radius="full"
            className="px-8 py-6 text-lg md:text-xl text-third bg-white hover:bg-gray-100 font-semibold mt-8"
          >
            Open App
          </Button>
        </div>
      </div>
      <div
        className="absolute top-0 right-0 h-full w-3/5 hidden md:block"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              #070A0F 0%,
              rgba(7,10,15,0.9) 20%,
              rgba(7,10,15,0.7) 50%,
              rgba(7,10,15,0.5) 70%,
              rgba(7,10,15,0.2) 90%,
              rgba(7,10,15,0) 100%
            ),
            url(${ImageHero})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="w-full h-full md:hidden relative">
        <img
          src={ImageHero}
          alt="Hero"
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-primary" />

      </div>

    </div>
  );
};

export default Hero;
