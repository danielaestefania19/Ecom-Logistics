import steps1 from '../../../assets/steps1.jpg';
import steps2 from '../../../assets/steps2.jpg';
import steps3 from '../../../assets/steps3.jpg';
import { useLanguage } from "../../i18n/LanguageContext";

const Request = () => {
  const { t } = useLanguage();

  const steps = [
    {
      image: steps1,
      title: t("tiktokShopRequest.step1Title"),
      description: t("tiktokShopRequest.step1Description"),
    },
    {
      image: steps2,
      title: t("tiktokShopRequest.step2Title"),
      description: t("tiktokShopRequest.step2Description"),
    },
    {
      image: steps3,
      title: t("tiktokShopRequest.step3Title"),
      description: t("tiktokShopRequest.step3Description"),
    },
  ];

  return (
    <section className="bg-white py-20 px-6  bg-no-repeat bg-cover bg-center">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-800">
            {t("tiktokShopRequest.title")}
          </h2>
        </div>
        <div className="flex flex-col gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-start w-full overflow-hidden hover:scale-105"
            >
              <div className="w-full md:w-96 h-64 md:h-72 flex-shrink-0">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-4 md:mb-6 leading-tight tracking-tight">
                  {step.title}
                </h2>
                <p className="text-lg font-medium text-black opacity-80">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Request;
