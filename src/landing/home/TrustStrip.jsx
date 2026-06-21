import { useLanguage } from "../i18n/LanguageContext";
import amazonLogo from "../../assets/amazon.png";
import tiktokLogo from "../../assets/tiktok.png";

/**
 * TrustStrip — platform logos + trust pills.
 * Shows which marketplaces Ecom Logistics serves and key trust signals
 * (no monthly fees, no contracts, free storage, volume discounts).
 */
const TrustStrip = () => {
  const { t } = useLanguage();
  const pills = t("trustPills", { returnObjects: true }) || [];

  return (
    <div className="bg-white border-b border-gray-100 px-6 sm:px-8 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">

        {/* Platform logos */}
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold whitespace-nowrap">
            {t("trustWorksOn")}
          </span>
          <div className="flex items-center gap-4">
            <img
              src={amazonLogo}
              alt="Amazon FBA"
              className="h-[18px] object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-200"
            />
            <img
              src={tiktokLogo}
              alt="TikTok Shop"
              className="h-[18px] object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-200"
            />
            <span className="text-gray-400 font-bold text-sm tracking-tight opacity-70 hover:opacity-100 transition duration-200">
              Shopify
            </span>
          </div>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          {pills.map((pill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-gray-600 text-xs font-medium bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full"
            >
              <svg
                className="w-3 h-3 text-third flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {pill}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TrustStrip;
