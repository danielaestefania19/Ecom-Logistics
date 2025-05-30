import React from "react";
import map1 from "../../../assets/map1.jpg";
import { Button } from "@heroui/react";
import { useLanguage } from "../../i18n/LanguageContext";

const CoverageMap = () => {
  const { t } = useLanguage();

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
              <span className="text-white">{t("coverageMap.title")}</span>
            </h2>

            <p className="text-white text-lg mb-4 leading-relaxed">
              {t("coverageMap.desc1.pre")}{" "}
              <span className="text-third font-semibold">{t("coverageMap.desc1.brand")}</span>
              {t("coverageMap.desc1.post")}
              <span className="text-third font-semibold"> {t("coverageMap.desc1.region")}</span>
              {t("coverageMap.desc1.end")}
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed">
              {t("coverageMap.desc2")}
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed">
              {t("coverageMap.desc3")}
            </p>

            <p className="text-white text-lg mb-8 leading-relaxed opacity-90 font-semibold italic">
              {t("coverageMap.contactPre")} <br />
              <span className="not-italic font-normal">{t("coverageMap.contactPost")}</span>
            </p>

            <a href="#contact">
              <Button
                radius="full"
                className="px-8 py-6 text-base md:text-lg text-white bg-third hover:opacity-90 transition font-semibold shadow-lg"
              >
                {t("coverageMap.button")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageMap;
