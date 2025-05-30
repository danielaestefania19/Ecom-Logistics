import React from "react";
import Fulfillment from "../../assets/Fulfillment.png";
import { useLanguage } from "../i18n/LanguageContext";

export default function FulfillmentPromise() {
  const { t } = useLanguage();

  return (
    <section className="py-24 px-6 bg-primary bg-no-repeat bg-cover bg-center">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
          <img
            src={Fulfillment}
            alt="Fulfillment warehouse"
            className="rounded-xl shadow-lg w-full max-w-xl"
          />
        </div>
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div className="bg-primary/50 rounded-2xl shadow-2xl p-10 text-center lg:text-left flex flex-col gap-6 max-w-xl transition-transform duration-300 hover:scale-105">
            <h2 className="text-2xl md:text-3xl font-bold text-third leading-tight tracking-tight">
              {t("fulfillmentHeadline")}
            </h2>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-white leading-tight">99.9%</span>
              <span className="text-base text-white opacity-80">{t("fulfillmentAccuracy")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-white leading-tight">99%</span>
              <span className="text-base text-white opacity-80">
                {t("fulfillmentOnTime")}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-white leading-tight">24 - 48 Hrs</span>
              <span className="text-base text-white opacity-80">
                {t("fulfillmentPreparation")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
