import LocalMovingImage from "../../../assets/LocalMovingImage.png";
import { Button } from "@heroui/react";
import { useLanguage } from "../../i18n/LanguageContext";

const LocalMoving = () => {
  const { t } = useLanguage();

  return (
    <section id="local-moving" className="bg-white py-24 px-6 bg-no-repeat bg-cover bg-center">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
          <img
            src={LocalMovingImage}
            alt="LocalMovingImage"
            className="rounded-xl shadow-lg w-full max-w-xl"
          />
        </div>
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div className="bg-primary rounded-2xl shadow-2xl p-10 text-center lg:text-left flex flex-col gap-6 max-w-xl transition-transform duration-300 hover:scale-105">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
              {t("localMoving.title")}
            </h2>
            <p className="text-base text-white opacity-90 leading-relaxed">
              {t("localMoving.description1.pre")}
              <span className="font-semibold text-white"> Ecom Logistics</span>
              {t("localMoving.description1.post")}
            </p>
            <p className="text-base text-white opacity-90 leading-relaxed">
              {t("localMoving.description2")}
            </p>
            <div className="mt-4">
              <a href="#contact">
                <Button
                  radius="full"
                  className="px-6 py-4 text-base md:text-lg text-white bg-third hover:opacity-90 transition font-semibold shadow-lg"
                >
                  {t("localMoving.button")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalMoving;
