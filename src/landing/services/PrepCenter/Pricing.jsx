import { Button } from "@heroui/react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link as ReactRouterLink } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { pricingSections, money } from "../../pricing/pricingData";

const Pricing = () => {
  const { t, language } = useLanguage();
  const lang = language === "es" ? "es" : "en";

  // Headline FBA prep prices (list) pulled from the single source of truth.
  const prep = pricingSections.find((s) => s.id === "fba-prep");
  const samples = prep.rows.slice(0, 3);

  return (
    <section className="bg-primary py-16 px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
        <div className="text-center px-2 md:px-0">
          <h2 className="text-third text-2xl sm:text-3xl font-bold mb-1">
            {t("prepPricing.title")}
          </h2>
          <span className="text-white text-2xl sm:text-3xl font-bold">
            {t("prepPricing.subtitle")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          {samples.map((row, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-6 text-center"
            >
              <p className="text-gray-300 text-sm mb-2 leading-snug">
                {row.label[lang]}
              </p>
              <p className="text-third text-2xl font-bold">
                {money(row.price)}
                <span className="text-gray-400 text-sm font-medium">
                  {prep.unit[lang]}
                </span>
              </p>
            </div>
          ))}
        </div>

        <p className="text-gray-300 text-sm -mt-3">
          {lang === "es"
            ? "Descuentos por volumen de hasta 15% · Sin cuotas mensuales"
            : "Volume discounts up to 15% off · No monthly fees"}
        </p>

        <Button
          as={ReactRouterLink}
          to="/pricing"
          onPress={() => window.scrollTo({ top: 0 })}
          size="lg"
          className="text-white bg-third hover:bg-third-dark px-8 py-4 rounded-xl transition duration-300 ease-in-out"
          endContent={<ArrowRightIcon className="h-5 w-5 ml-2" />}
        >
          {lang === "es" ? "Ver precios completos" : "See full pricing"}
        </Button>
      </div>
    </section>
  );
};

export default Pricing;
