import { useLanguage } from "../i18n/LanguageContext";
import ourstory from '../../assets/ourstory.png';

const OurStory = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-24 px-6 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Imagen a la izquierda */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src={ourstory}
            alt="Ecom Logistics Story"
            className="rounded-2xl shadow-lg w-full max-w-md"
          />
        </div>

        {/* Texto a la derecha */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-4xl font-bold text-primary mb-6 text-center lg:text-left">
            {t("AboutUs.storyTitle")}
          </h2>

          <p className="text-lg text-primary leading-relaxed text-center lg:text-left mb-6">
            {t("AboutUs.storyIntro")}
          </p>

          <div className="border-l-4 border-primary pl-6 text-base md:text-lg text-gray-700 leading-relaxed space-y-5">
            <p>
              {t("AboutUs.storyParagraph1.pre")}
              <span className="font-semibold text-primary">{t("AboutUs.storyParagraph1.highlight")}</span>
              {t("AboutUs.storyParagraph1.post")}
            </p>
            <p>
              {t("AboutUs.storyParagraph2.pre")}
              <span className="font-semibold text-primary">{t("AboutUs.storyParagraph2.highlight")}</span>
              {t("AboutUs.storyParagraph2.post")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
