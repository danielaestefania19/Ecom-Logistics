import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@heroui/react";
import { useLanguage } from "../../i18n/LanguageContext";
import topIcon from "../../../assets/top.png";
import supportIcon from "../../../assets/support.png";
import competitiveIcon from "../../../assets/competitive.png";
import IconEcom from "../../../assets/Icon-ecologistic.png";
import social from "../../../assets/social.png";

const Icon = ({ available, label }) => (
  <Tooltip content={label} placement="top">
    {available ? (
      <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400 mx-auto" />
    ) : (
      <XCircleIcon className="w-6 h-6 text-red-500 dark:text-red-400 mx-auto" />
    )}
  </Tooltip>
);

const WhyChooseUs = () => {
  const { t } = useLanguage();

  const introItems = [
    {
      icon: topIcon,
      title: t("whyChooseUs.intro.0.title"),
      description: t("whyChooseUs.intro.0.description"),
    },
    {
      icon: supportIcon,
      title: t("whyChooseUs.intro.1.title"),
      description: t("whyChooseUs.intro.1.description"),
    },
    {
      icon: competitiveIcon,
      title: t("whyChooseUs.intro.2.title"),
      description: t("whyChooseUs.intro.2.description"),
    },
  ];

  const featuresData = t("whyChooseUs.features", { returnObjects: true });

  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          {t("whyChooseUs.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 text-center">
          {introItems.map(({ icon, title, description }, idx) => (
            <div key={idx} className="flex flex-col items-center px-4">
              <img src={icon} alt={title} className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-primary text-white text-base">
                <th className="px-6 py-4 text-left font-semibold">{t("whyChooseUs.table.feature")}</th>
                <th className="px-6 py-4 text-center font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    <span>Ecom Logistics</span>
                    <img src={IconEcom} alt="Ecom Logistics" className="w-5 h-5" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    <span>Amazon LTL</span>
                    <img src={social} alt="Amazon LTL" className="w-7 h-7" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center font-semibold">{t("whyChooseUs.table.others")}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-200 text-sm">
              {featuresData.map(([featureKey, ecom, amazon, others], index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0
                      ? "bg-gray-50 dark:bg-gray-800"
                      : "bg-white dark:bg-gray-900"
                  }
                >
                  <td className="px-6 py-4 font-medium">{t(`whyChooseUs.featureLabels.${featureKey}`)}</td>
                  <td className="px-6 py-4 text-center">
                    {typeof ecom === "string" ? ecom : <Icon available={ecom} label={t(`whyChooseUs.featureLabels.${featureKey}`)} />}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof amazon === "string" ? amazon : <Icon available={amazon} label={t(`whyChooseUs.featureLabels.${featureKey}`)} />}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof others === "string" ? others : <Icon available={others} label={t(`whyChooseUs.featureLabels.${featureKey}`)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
