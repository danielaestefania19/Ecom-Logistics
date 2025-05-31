import React from "react";
import FastDelivery from "../../assets/FastDelivery.png";
import { useLanguage } from "../i18n/LanguageContext";

export default function FastDeliverySection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-24 px-6 bg-no-repeat bg-cover bg-center">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center lg:text-right flex flex-col gap-4 max-w-xl transition-transform duration-300 hover:scale-105">
            <h2 className="text-2xl md:text-3xl font-extrabold text-blue leading-tight">
              {t("fastTitle")}
            </h2>
            <p className="text-xl md:text-2xl font-semibold text-blue-600 leading-snug">
              {t("fastSubtitle")}
            </p>
            <ul className="text-lg md:text-xl text-gray-700 space-y-2 list-none mt-2">
              <li className="flex items-center gap-2 justify-center lg:justify-end">
                <span className="text-primary font-bold">✓</span> {t("fastBenefit1")}
              </li>
              <li className="flex items-center gap-2 justify-center lg:justify-end">
                <span className="text-primary font-bold">✓</span> {t("fastBenefit2")}
              </li>
              <li className="flex items-center gap-2 justify-center lg:justify-end">
                <span className="text-primary font-bold">✓</span> {t("fastBenefit3")}
              </li>
            </ul>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src={FastDelivery}
            alt="LTL Shipment Delivery"
            className="rounded-2xl shadow-xl w-full max-w-xl"
          />
        </div>
      </div>
    </section>
  );
}
