import React from "react";
import map from "../../assets/map.png";
import { Button } from "@heroui/react";
import { useLanguage } from "../i18n/LanguageContext";

const CoverageMap = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-black text-white px-6 py-16 md:py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Imagen del mapa */}
        <div className="relative w-full md:w-1/2 mb-12 md:mb-0">
          <img
            src={map}
            alt="World Map"
            className="w-[110%] md:w-[110%] max-w-none -ml-6 md:-ml-12"
          />
        </div>

        {/* Texto y botón */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="text-center md:text-left max-w-xl">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              <span className="text-white">{t("coverageHeadline")}</span>
            </h2>

            <p className="text-white text-lg mb-4 leading-relaxed">
              {t("coverageFactPrefix")}{" "}
              <span className="text-third font-semibold">{t("coverageFactHighlight1")}</span>{" "}
              {t("coverageFactMiddle")}{" "}
              <span className="text-third font-bold opacity-90">{t("coverageFactHighlight2")}</span>,{" "}
              {t("coverageFactSuffix")}{" "}
              <span className="text-third font-semibold">{t("coverageFactHighlight3")}</span>
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed opacity-90">
              {t("coverageWelcomePrefix")}{" "}
              <span className="text-third font-semibold">{t("coverageWelcomeHighlight")}</span>,{" "}
              {t("coverageWelcomeSuffix")}
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed opacity-90">
              {t("coverageCenterPrefix")}{" "}
              <span className="text-third font-bold">{t("coverageCenterHighlight")}</span>.
            </p>

            <p className="text-white text-lg mb-4 leading-relaxed opacity-90">
              📍 {t("coverageBayAreaPrefix")}{" "}
              <span className="text-white font-semibold">{t("coverageBayAreaHighlight")}</span>,{" "}
              {t("coverageBayAreaSuffix")}
            </p>

            <p className="text-white text-lg mb-8 leading-relaxed opacity-70 italic">
              {t("coverageClosing")}
            </p>

            <a href="#contact">
              <Button
                radius="full"
                className="px-8 py-6 text-base md:text-lg text-white bg-third hover:opacity-90 transition font-semibold shadow-lg"
              >
                {t("contactUsToday")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageMap;
