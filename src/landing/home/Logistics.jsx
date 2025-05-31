import { Button } from "@heroui/react";
import { useLanguage } from "../i18n/LanguageContext";

const Logistics = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-24 px-4">
      <div className="max-w-3xl mx-auto bg-primary/5 rounded-2xl shadow-xl px-6 sm:px-12 py-16 text-center space-y-6 transition-transform duration-300 hover:scale-105">
        <h2 className="text-third text-2xl sm:text-3xl font-bold">
          {t("logisticsTitle")}
        </h2>
        <p className="text-gray-900 text-2xl sm:text-3xl font-bold leading-tight">
          {t("logisticsSubtitleLine1")}
          <br />
          {t("logisticsSubtitleLine2")}
        </p>

        <p className="text-gray-700 text-lg sm:text-xl font-medium">
          {t("logisticsDescription")}
        </p>
        <div className="pt-6">
          <a href="#contact">
            <Button
              radius="full"
              className="px-10 py-4 sm:py-5 text-base sm:text-lg md:text-xl bg-third text-white font-semibold transition-transform transform hover:scale-105 shadow-md"
              type="button"
            >
              {t("logisticsButton")}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Logistics;
