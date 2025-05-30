import {
  PhoneIcon,
  TruckIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/24/solid";
import { useLanguage } from "../../i18n/LanguageContext";

const Request = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <PhoneIcon className="w-10 h-10 text-white" />,
      title: t("request.step1.title"),
      description: t("request.step1.description"),
    },
    {
      icon: <BuildingStorefrontIcon className="w-10 h-10 text-white" />,
      title: t("request.step2.title"),
      description: t("request.step2.description"),
    },
    {
      icon: <CurrencyDollarIcon className="w-10 h-10 text-white" />,
      title: t("request.step3.title"),
      description: t("request.step3.description"),
    },
    {
      icon: <TruckIcon className="w-10 h-10 text-white" />,
      title: t("request.step4.title"),
      description: t("request.step4.description"),
    },
    {
      icon: <InboxArrowDownIcon className="w-10 h-10 text-white" />,
      title: t("request.step5.title"),
      description: t("request.step5.description"),
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50 font-montserrat">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-10">
          {t("request.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-200 hover:shadow-xl transition"
            >
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-third">
                {step.icon}
              </div>
              <h3 className="text-md font-semibold text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-gray-700 leading-snug">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Request;
