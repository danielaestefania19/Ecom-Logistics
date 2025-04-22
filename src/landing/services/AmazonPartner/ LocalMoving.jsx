import LocalMovingImage from '../../../assets/LocalMovingImage.png';
import { Button } from '@heroui/react';

const LocalMoving = () => (
  <section className="bg-white py-24 px-6 bg-no-repeat bg-cover bg-center">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
      
      {/* Imagen */}
      <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
        <img
          src={LocalMovingImage}
          alt="LocalMovingImage"
          className="rounded-xl shadow-lg w-full max-w-xl"
        />
      </div>

      {/* Contenido */}
      <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
        <div className="bg-primary rounded-2xl shadow-2xl p-10 text-center lg:text-left flex flex-col gap-6 max-w-xl transition-transform duration-300 hover:scale-105">
          
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
          Local Moving!
          </h2>

          <p className="text-base text-white opacity-90 leading-relaxed">
            Whether you're picking up goods from your supplier or handling local deliveries in California (LTL or SPD),
            <span className="font-semibold text-white"> Ecom Logistics</span> has you covered. Our extensive fleet,
            combined with trusted logistics partners, ensures seamless operations with flexible,
            reliable service tailored to your needs.
          </p>

          <p className="text-base text-white opacity-90 leading-relaxed">
            Contact us today for a customized quote!
          </p>

          <div className="mt-4">
            <a href="#contact">
              <Button
                radius="full"
                className="px-6 py-4 text-base md:text-lg text-white bg-third hover:opacity-90 transition font-semibold shadow-lg"
              >
                Contact Us
              </Button>
            </a>
          </div>
          
        </div>
      </div>
    </div>
  </section>
);

export default LocalMoving;
