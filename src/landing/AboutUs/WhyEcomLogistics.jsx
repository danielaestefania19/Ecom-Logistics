import {
  TruckIcon,
  GlobeAmericasIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import { Button } from "@heroui/react";
import { useLanguage } from "../i18n/LanguageContext";

const icons = [
  GlobeAmericasIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  TruckIcon,
  UserGroupIcon,
  HandRaisedIcon,
];

const WhyEcomLogistics = () => {
  const { t } = useLanguage();
  const content = t("whyEcomLogistics");

  return (
    <section className="bg-primary text-white py-20 px-6 md:px-20">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{content.title}</h2>
        <p className="text-lg text-gray-300 mb-12">{content.intro}</p>

        <div className="grid md:grid-cols-2 gap-10 text-left">
          {content.features.map((feature, index) => {
            const Icon = icons[index];
            return (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-third text-white p-3 rounded-xl shadow-md">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-400 mt-1">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12">
          <p className="mt-8 text-lg font-medium">{content.conclusion1}</p>
          <p className="text-gray-300 mt-4 text-lg">{content.conclusion2}</p>
          <div className="mt-6">
            <a href="#contact">
              <Button
                radius="full"
                className="px-6 py-6 text-lg md:text-xl text-white bg-third hover:bg-white-100 font-semibold mt-8"
              >
                {content.button}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyEcomLogistics;
