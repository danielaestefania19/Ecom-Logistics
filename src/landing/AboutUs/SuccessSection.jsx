import { useLanguage } from "../i18n/LanguageContext";

const SuccessSection = () => {
  const { t } = useLanguage();
  const content = t("successSection");

  return (
    <section className="bg-white py-24 px-6 lg:px-24 text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="text-center text-primary max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">{content.title}</h2>
          <p className="text-lg leading-relaxed text-primary mb-4">
            {content.paragraph1}
          </p>
          <p className="text-xl font-semibold mt-6">{content.highlight}</p>
          <p className="mt-2 text-primary">{content.call}</p>
        </div>
      </div>
    </section>
  );
};

export default SuccessSection;
