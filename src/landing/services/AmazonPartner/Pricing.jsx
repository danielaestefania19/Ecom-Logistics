import { Button } from "@heroui/react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../i18n/LanguageContext";
import PriceListPrepLTL from "../../../assets/PriceListPrep&LTL.pdf";

const Pricing = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-primary py-16 px-8">
      <div className="max-w-7xl mx-auto flex justify-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24 w-full">
          <div className="text-center md:text-left px-2 md:px-0">
            <h2 className="text-third text-2xl sm:text-3xl font-bold mb-1">
              {t("pricingAmazon.title")}
            </h2>
            <span className="text-white text-2xl sm:text-3xl font-bold">
              {t("pricingAmazon.subtitle")}
            </span>
          </div>
          <div>
            <div className="w-full px-2 md:px-0">
              <a href={PriceListPrepLTL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="text-white bg-third hover:bg-third-dark px-8 py-4 rounded-xl transition duration-300 ease-in-out"
                  endContent={<ArrowRightIcon className="h-5 w-5 ml-2" />}
                >
                  {t("pricingAmazon.button")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
