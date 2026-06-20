import React from "react";
import { Link as ReactRouterLink } from "react-router-dom";
import Seo from "../seo/Seo";
import { SITE, buildServiceSchema, buildFaqSchema } from "../seo/siteData";
import { useLanguage } from "../i18n/LanguageContext";
import Navbar from "../home/Navbar";
import ContactUs from "../home/ContacUs";
import Footer from "../home/Footer";
import {
  pricingSections,
  paymentFees,
  VOLUME_TIERS,
  money,
} from "./pricingData";

const Pricing = () => {
  const { t, language } = useLanguage();
  const lang = language === "es" ? "es" : "en";
  const tiers = VOLUME_TIERS[lang];
  const faq = t("pricingPage.faq", { returnObjects: true }) || [];
  const notes = t("pricingPage.notes", { returnObjects: true }) || [];

  const description =
    lang === "es"
      ? "Precios de Ecom Logistics: preparación FBA, pick & pack 3PL, almacenamiento y carga en Hayward, CA. Tarifas transparentes con descuentos por volumen, sin cuotas mensuales ni costos ocultos."
      : "Ecom Logistics pricing: FBA prep, 3PL pick & pack, storage and freight in Hayward, CA. Transparent rates with automatic volume discounts, no monthly fees and no hidden costs.";

  // Render the price cell(s) for a row.
  const tierPrices = (price, discount, unitSuffix) => {
    const value = discount ? money(price * (1 - discount)) : money(price);
    return `${value}${unitSuffix || ""}`;
  };

  return (
    <>
      <Seo
        title="FBA Prep & 3PL Pricing | Volume Discounts | Ecom Logistics"
        description={description}
        path="/pricing"
        lang={lang}
        schema={[
          buildServiceSchema({
            name: "FBA Prep & 3PL Fulfillment Pricing",
            description,
            path: "/pricing",
          }),
          buildFaqSchema(faq),
        ].filter(Boolean)}
      />

      <div className="bg-white text-gray-800">
        <Navbar />

        {/* Hero */}
        <section className="bg-primary text-white px-6 sm:px-8 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-block text-third font-semibold tracking-widest uppercase text-sm mb-4">
              {t("pricingPage.heroEyebrow")}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              {t("pricingPage.heroTitle")}
            </h1>
            <p className="text-gray-200 text-base sm:text-lg max-w-3xl mx-auto mb-8">
              {t("pricingPage.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact-us"
                className="bg-third hover:bg-third-dark text-white font-semibold px-8 py-3 rounded-xl transition duration-300"
              >
                {t("pricingPage.ctaQuote")}
              </a>
              <a
                href={SITE.nap.phoneHref}
                className="border border-white/70 hover:bg-white hover:text-primary text-white font-semibold px-8 py-3 rounded-xl transition duration-300"
              >
                {t("pricingPage.ctaCall")} · {SITE.nap.phone}
              </a>
            </div>
          </div>
        </section>

        {/* Volume tiers explainer */}
        <section className="px-6 sm:px-8 py-12 bg-gray-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              {t("pricingPage.volumeTitle")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              {t("pricingPage.volumeSubtitle")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {tiers.map((tier, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-6 ${
                    i === 2
                      ? "border-third bg-white shadow-lg ring-2 ring-third/30"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <p className="text-primary font-bold text-lg">{tier.label}</p>
                  <p
                    className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      tier.discount
                        ? "bg-third/15 text-third-dark"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tier.badge}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing sections */}
        <section className="px-6 sm:px-8 py-14">
          <div className="max-w-5xl mx-auto space-y-12">
            {pricingSections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm scroll-mt-24"
              >
                <div className="bg-primary px-6 py-5">
                  <h3 className="text-white text-xl sm:text-2xl font-bold">
                    {section.title[lang]}
                  </h3>
                  {section.subtitle && (
                    <p className="text-gray-300 text-sm mt-1">
                      {section.subtitle[lang]}
                    </p>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[480px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wide">
                        <th className="px-6 py-3 font-semibold">
                          {t("pricingPage.tableService")}
                        </th>
                        {section.tiered ? (
                          tiers.map((tier, i) => (
                            <th
                              key={i}
                              className="px-4 py-3 font-semibold text-right whitespace-nowrap"
                            >
                              {tier.label}
                              <span className="block text-[11px] normal-case font-medium text-third-dark">
                                {tier.badge}
                              </span>
                            </th>
                          ))
                        ) : (
                          <th className="px-6 py-3 font-semibold text-right">
                            {t("pricingPage.tablePrice")}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {section.rows.map((row, ri) => {
                        const unitSuffix =
                          typeof row.price === "number" && section.unit
                            ? section.unit[lang]
                            : "";
                        return (
                          <tr key={ri} className="hover:bg-gray-50/70">
                            <td className="px-6 py-4 text-gray-800">
                              {row.label[lang]}
                            </td>
                            {section.tiered ? (
                              tiers.map((tier, ti) => (
                                <td
                                  key={ti}
                                  className={`px-4 py-4 text-right font-semibold whitespace-nowrap ${
                                    ti === 2 ? "text-third-dark" : "text-primary"
                                  }`}
                                >
                                  {tierPrices(row.price, tier.discount, unitSuffix)}
                                </td>
                              ))
                            ) : (
                              <td className="px-6 py-4 text-right font-semibold text-primary whitespace-nowrap">
                                {typeof row.price === "number"
                                  ? `${money(row.price)}${
                                      row.suffix ? row.suffix[lang] : ""
                                    }`
                                  : row.price[lang]}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Payment processing strip */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-100 px-6 py-4">
                <h3 className="text-primary text-lg font-bold">
                  {paymentFees.title[lang]}
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row">
                {paymentFees.rows.map((row, i) => (
                  <div
                    key={i}
                    className="flex-1 px-6 py-4 flex items-center justify-between border-t sm:border-t-0 sm:border-l first:border-l-0 border-gray-100"
                  >
                    <span className="text-gray-700">{row.label[lang]}</span>
                    <span className="font-semibold text-primary">{row.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What's included + oversize */}
        <section className="px-6 sm:px-8 pb-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-7">
              <h3 className="text-primary text-xl font-bold mb-4">
                {t("pricingPage.noteTitle")}
              </h3>
              <ul className="space-y-3">
                {notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-1 h-2 w-2 rounded-full bg-third flex-shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-primary text-white p-7">
              <h3 className="text-xl font-bold mb-3 text-third">
                {t("pricingPage.oversizeTitle")}
              </h3>
              <p className="text-gray-200 leading-relaxed">
                {t("pricingPage.oversizeText")}
              </p>
            </div>
          </div>
          <p className="max-w-5xl mx-auto text-xs text-gray-400 mt-6 text-center">
            {t("pricingPage.finePrint")}
          </p>
        </section>

        {/* Pricing FAQ */}
        <section className="px-6 sm:px-8 pb-16 bg-gray-50 pt-14">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-8">
              {t("pricingPage.faqTitle")}
            </h2>
            <div className="space-y-4">
              {faq.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl bg-white border border-gray-200 p-5"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-primary list-none">
                    {item.question}
                    <span className="ml-4 text-third transition-transform group-open:rotate-45 text-2xl leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div id="contact-us">
          <ContactUs />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
