import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function LocationSection() {
  const { t } = useLanguage();

  return (
    <section className="w-full bg-white py-20 px-6 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-3">
            {t("locationTitle")}
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
            {t("locationSubtitle")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Info card */}
          <div className="w-full lg:w-2/5 bg-primary rounded-2xl p-8 md:p-10 text-white flex flex-col gap-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="bg-third rounded-xl p-3 mt-1 shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{t("locationAddressLabel")}</h3>
                <p className="text-white/80 leading-relaxed">
                  25509 Industrial Blvd,<br />
                  Suite E3, Hayward,<br />
                  CA 94545
                </p>
              </div>
            </div>

            <div className="border-t border-white/10" />

            <div className="flex items-start gap-4">
              <div className="bg-third rounded-xl p-3 mt-1 shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{t("locationHoursLabel")}</h3>
                <p className="text-white/80 leading-relaxed">
                  {t("locationHoursWeekdays")}<br />
                  {t("locationHoursWeekend")}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10" />

            <div className="flex items-start gap-4">
              <div className="bg-third rounded-xl p-3 mt-1 shrink-0">
                <Phone className="w-6 h-6 text-white bg" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{t("locationPhoneLabel")}</h3>
                <a
                  href="tel:+13412089445"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  +1 (341) 208-9445
                </a>
              </div>
            </div>

            <div className="border-t border-white/10" />
<a
              href="https://www.google.com/maps?cid=3277432369041198767&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=en&gl=US&source=embed"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary font-semibold rounded-full px-6 py-3 mt-2 hover:bg-gray-200 transition-colors w-fit"
            >
              <Navigation className="w-4 h-4" />
              {t("locationDirections")}
            </a>
          </div>

          {/* Map */}
          <div className="w-full lg:w-3/5 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
            <iframe
              title="Ecom Logistics Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3163.3847!2d-122.1169308!3d37.6357763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f9769122db953%3A0x2d7bc76004114eaf!2sEcom%20Logistics%20-%20Amazon%20FBA%20Prep%20Center!5e0!3m2!1sen!2sus!4v1715700000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
