import { Truck, Warehouse, Box, Move } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const icons = [Truck, Warehouse, Box, Move];

const WhatWeOffer = () => {
  const { t } = useLanguage();
  const content = t("whatWeOffer");

  return (
    <section className="bg-white py-24 px-6 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-6">
            {content.title}
          </h2>
          <p className="text-lg text-third leading-relaxed">{content.intro}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.services.map(({ title, description }, index) => {
            const Icon = icons[index];
            return (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-md hover:shadow-lg transition duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gray-200 p-2 rounded-full">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue">{title}</h3>
                </div>
                <p className="text-gray-600 text-base leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
        <p className="text-center text-gray-700 text-lg max-w-4xl mx-auto mt-8">
          {content.conclusion}
        </p>
      </div>
    </section>
  );
};

export default WhatWeOffer;
