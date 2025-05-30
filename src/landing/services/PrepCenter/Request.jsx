import {
  InboxArrowDownIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CubeIcon,
  TruckIcon,
  DocumentMagnifyingGlassIcon
} from "@heroicons/react/24/solid";

import { useLanguage } from "../../i18n/LanguageContext";

const Request = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <InboxArrowDownIcon className="w-7 h-7 text-white" />,
      title: t("logistics.steps.receiving.title"),
      description: t("logistics.steps.receiving.description")
    },
    {
      icon: <MagnifyingGlassIcon className="w-7 h-7 text-white" />,
      title: t("logistics.steps.inspection.title"),
      description: t("logistics.steps.inspection.description")
    },
    {
      icon: <TagIcon className="w-7 h-7 text-white" />,
      title: t("logistics.steps.prep.title"),
      description: t("logistics.steps.prep.description")
    },
    {
      icon: <CubeIcon className="w-7 h-7 text-white" />,
      title: t("logistics.steps.storage.title"),
      description: t("logistics.steps.storage.description")
    },
    {
      icon: <TruckIcon className="w-7 h-7 text-white" />,
      title: t("logistics.steps.shipping.title"),
      description: t("logistics.steps.shipping.description")
    },
    {
      icon: <DocumentMagnifyingGlassIcon className="w-7 h-7 text-white" />,
      title: t("logistics.steps.compliance.title"),
      description: t("logistics.steps.compliance.description")
    }
  ];

  return (
    <section className="py-20 px-6 bg-primary font-montserrat text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          {t("logistics.title")}
        </h2>
        <p className="text-center text-gray-300 mb-12 max-w-3xl mx-auto">
          {t("logistics.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 bg-[#1e232d] rounded-xl p-6 border border-gray-700 shadow hover:shadow-lg transition"
            >
              <div className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full bg-blue-600">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-gray-300 font-medium">
          {t("logistics.footer")}
        </p>
      </div>
    </section>
  );
};

export default Request;
