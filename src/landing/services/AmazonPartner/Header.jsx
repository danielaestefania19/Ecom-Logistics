import { Button } from "@heroui/react";
import TruckImage from '../../../assets/TruckImage.png';


const Header = () => (
  <div className="relative w-full min-h-[80vh] flex flex-col md:flex-row bg-primary text-white overflow-hidden font-montserrat">
    {/* Contenido de texto */}
    <div className="relative z-10 w-full md:w-1/2 px-6 sm:px-10 md:px-20 lg:px-32 py-20 flex flex-col justify-center text-center md:text-left">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-md">
        Amazon Partner Carrier <br className="hidden md:block" /> <span className="text-third">LTL & FTL</span>
      </h1>

      <h2 className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-4">
        Your Logistics Partner for Amazon Fulfillment Center Shipments
      </h2>

      <p className="text-sm md:text-base lg:text-lg text-gray-200 max-w-xl mb-4 mx-auto md:mx-0">
        We simplify your logistics to Amazon FBA. We handle your LTL and FTL shipments from residential or commercial
        locations across Northern California. We also take care of appointment scheduling and delivery.
      </p>

      <p className="text-blue-400 font-semibold text-base md:text-lg mb-6">
        Plus, we offer some of the best rates and fastest delivery times in the region.
      </p>

      <a href="#contact">
        <Button
          radius="md"
          className="bg-third hover:bg-blue-700 transition text-white px-6 py-3 text-lg font-medium shadow-lg"
        >
          Request a Quote
        </Button>
      </a>
    </div>

    {/* Imagen decorativa para desktop */}
    <div
  className="absolute top-0 right-0 h-full w-3/5 hidden md:block"
  style={{
    backgroundImage: `
      linear-gradient(
        to right,
        rgba(7, 10, 15, 1) 0%,
        rgba(7, 10, 15, 0.8) 10%,
        rgba(7, 10, 15, 0.2) 40%,
        rgba(7, 10, 15, 0) 50%,
        rgba(7, 10, 15, 0.2) 60%,
        rgba(7, 10, 15, 0.8) 90%,
        rgba(7, 10, 15, 1) 100%
      ),
      url(${TruckImage})
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
/>


    {/* Imagen para móviles */}
    <div className="w-full md:hidden relative h-[300px]">
      <img
        src={TruckImage}
        alt="Truck delivering for Amazon"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent" />
    </div>
  </div>
);

export default Header;
