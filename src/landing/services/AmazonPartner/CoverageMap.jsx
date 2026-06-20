import React from "react";
import map1 from "../../../assets/map1.webp";
import { Button } from "@heroui/react";
import { useLanguage } from "../../i18n/LanguageContext";

const CoverageMap = () => {
  const { t } = useLanguage();


  return (
    <section className="bg-black text-white px-4 py-16 md:py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="relative w-full md:w-1/2 mb-12 md:mb-0">
          <img
            src={map1}
            alt="World Map"
            className="w-[110%] md:w-[110%] max-w-none -ml-6 md:-ml-12"
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="text-center md:text-left max-w-xl">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              <span className="text-white">{t("coverageMap.title")}</span>
            </h2>
            <p className="text-white text-lg mb-4 leading-relaxed">
              {t("coverageMap.desc1.pre")}
              <span className="font-semibold">{t("coverageMap.desc1.brand")}</span>
              {t("coverageMap.desc1.post")}
              <span className="font-semibold">{t("coverageMap.desc1.role1")}</span>
              {t("coverageMap.desc1.and")}
              <span className="font-semibold">{t("coverageMap.desc1.role2")}</span>
              {t("coverageMap.desc1.comma")}
              <span className="font-semibold">{t("coverageMap.desc1.service1")}</span>
              {t("coverageMap.desc1.and2")}
              <span className="font-semibold">{t("coverageMap.desc1.service2")}</span>
              {t("coverageMap.desc1.region")}
              <span className="font-semibold">{t("coverageMap.desc1.area")}</span>
              {t("coverageMap.desc1.end")}
              <span className="font-semibold">{t("coverageMap.desc1.solutions")}</span>
              {t("coverageMap.desc1.ensure")}
              <span className="font-semibold">{t("coverageMap.desc1.target")}</span>
              {t("coverageMap.desc1.final")}
            </p>

            {/* Frase de expansión de red */}
            <p className="text-white text-lg mb-4 leading-relaxed">
              {t("coverageMap.desc2.pre")}
              <span className="font-semibold">{t("coverageMap.desc2.bold")}</span>
            </p>

            {/* Descripción de seguimiento y soporte */}
            <p className="text-white text-lg mb-4 leading-relaxed">
              {t("coverageMap.desc3.pre")}
              <span className="font-semibold">{t("coverageMap.desc3.bold1")}</span>
              {t("coverageMap.desc3.mid1")}
              <span className="font-semibold">{t("coverageMap.desc3.bold2")}</span>
              {t("coverageMap.desc3.mid2")}
              <span className="font-semibold">{t("coverageMap.desc3.bold3")}</span>
              {t("coverageMap.desc3.mid3")}
              <span className="font-semibold">{t("coverageMap.desc3.bold4")}</span>
              {t("coverageMap.desc3.mid4")}
              <span className="font-semibold">{t("coverageMap.desc3.bold5")}</span>
              {t("coverageMap.desc3.end")}
            </p>

            {/* Contacto */}
            <p className="text-white text-lg mb-8 leading-relaxed opacity-90 font-semibold italic">
              {t("coverageMap.contactPre.pre")}
              <span className="font-semibold not-italic">{t("coverageMap.contactPre.bold")}</span>
              {t("coverageMap.contactPre.post")}
              <br />
              <span className="not-italic font-normal">
                {t("coverageMap.contactPost.pre")}
                <span className="font-semibold">{t("coverageMap.contactPost.bold")}</span>
                {t("coverageMap.contactPost.post")}
              </span>
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
