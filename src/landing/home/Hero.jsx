import { Button } from "@heroui/react";
import ImageHero from "../../assets/ImageHero.jpg";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../i18n/LanguageContext";

const Hero = () => {
  const { t, language } = useLanguage();
  const isSpanish = language === "es";

  return (
    <div className="relative w-full min-h-[70vh] flex flex-col md:flex-row text-white bg-primary overflow-hidden">
      <Helmet>
        <title>{isSpanish ? "Inicio - Ecom Logistics" : "Home - Ecom Logistics"}</title>
        <meta
          name="description"
          content={
            isSpanish
              ? "Ecom Logistics ofrece soluciones logísticas 3PL integrales para e-commerce. Desde preparación de FBA y pick and pack, hasta envíos LTL y FTL de Amazon, optimizamos su cadena de suministro. ¡Crece con nosotros!"
              : "Ecom Logistics offers end-to-end 3PL logistics for e-commerce. From 3PL pick and pack, Amazon prep center services to Amazon LTL & FTL shipments, we optimize your supply chain. Grow with us!"
          }
        />
      </Helmet>

      <div className="relative z-10 w-full md:w-1/2 p-8 md:pl-28 md:pr-10 lg:pl-36 lg:pr-20 xl:pl-48 xl:pr-28 md:py-24 font-montserrat flex-1 md:flex md:flex-col md:justify-center md:items-start text-center md:text-left">
        {isSpanish ? (
          <h1 className="text-4xl md:text-6xl font-semibold mb-9">
            Soluciones de logísticas de <br />{" "}
            <span className="text-third">E-Commerce</span>
          </h1>
        ) : (
          <>
            <h1 className="text-4xl md:text-6xl font-semibold mb-8">
              <span className="text-third mb-9">E-Commerce</span>  <br/>
              {t("heroHeadline2")}
            </h1>
          </>
        )}

        <p className="text-xl sm:text-base md:text-3xl font-light w-full mb-4 sm:mb-2">
          {t("heroDesc1")}
        </p>
        <p className="text-xl sm:text-base md:text-3xl font-light w-full mb-4 sm:mb-2">
          {t("heroDesc2")}
        </p>
        <div className="flex gap-4 justify-center md:justify-start">
          <a href="#contact">
            <Button
              radius="full"
              className="px-6 py-6 text-lg md:text-xl text-white bg-third hover:bg-white-100 font-semibold mt-8"
            >
              {t("getStarted")}
            </Button>
          </a>
        </div>
      </div>

      {/* Imagen lateral para escritorio */}
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

      {/* Imagen para móvil */}
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
