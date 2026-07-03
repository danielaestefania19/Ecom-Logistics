import { useLanguage } from "../i18n/LanguageContext";

/**
 * AmazonBanner — urgency strip about the Amazon 2026 FBA in-house prep elimination.
 * Placed between Hero and Services so it's one of the first things visitors read.
 */
const AmazonBanner = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-primary border-b border-third/30 px-6 sm:px-8 py-7 sm:py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Badge */}
        <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-third text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          {t("amazonBannerBadge")}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm sm:text-base leading-snug">
            {t("amazonBannerTitle")}
          </p>
          <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">
            {t("amazonBannerSub")}
          </p>
        </div>

        {/* CTA */}
        <a
          href="#contact"
          className="flex-shrink-0 bg-third hover:bg-third-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition duration-200 whitespace-nowrap"
        >
          {t("amazonBannerCta")}
        </a>
      </div>
    </section>
  );
};

export default AmazonBanner;
