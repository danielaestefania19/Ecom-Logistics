import React, { useState } from "react";
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

const Icon = ({ name, className = "w-5 h-5" }) => {
  const paths = {
    box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
    truck: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
    warehouse: "M22 8.35V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.35a1 1 0 0 1 .59-.91l9-4.05a1 1 0 0 1 .82 0l9 4.05a1 1 0 0 1 .59.91zM6 18h12M6 14h12M6 10h12",
    inbound: "M12 3v12m0 0 4-4m-4 4-4-4M4 21h16",
    plus: "M12 5v14M5 12h14",
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] || paths.box} />
    </svg>
  );
};

const Pricing = () => {
  const { t, language } = useLanguage();
  const lang = language === "es" ? "es" : "en";
  const tiers = VOLUME_TIERS[lang];
  const faq = t("pricingPage.faq", { returnObjects: true }) || [];
  const notes = t("pricingPage.notes", { returnObjects: true }) || [];

  const TABS = [
    { id: "fulfillment", label: t("pricingPage.tabFulfillment"), ids: ["fba-prep", "pick-pack", "add-ons"] },
    { id: "warehouse", label: t("pricingPage.tabWarehouse"), ids: ["storage", "receiving", "materials"] },
  ];
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const activeIds = TABS.find((tb) => tb.id === activeTab).ids;
  const visibleSections = pricingSections.filter((s) => activeIds.includes(s.id));

  const trustPills =
    lang === "es"
      ? ["Sin cuotas mensuales", "Sin contratos", "7 días de almacén gratis", "Descuentos por volumen"]
      : ["No monthly fees", "No contracts", "7 days free storage", "Automatic volume discounts"];

  const description =
    lang === "es"
      ? "Precios de Ecom Logistics: preparación FBA, pick & pack 3PL, almacenamiento y carga en Hayward, CA. Tarifas transparentes con descuentos por volumen, sin cuotas mensuales ni costos ocultos."
      : "Ecom Logistics pricing: FBA prep, 3PL pick & pack, storage and freight in Hayward, CA. Transparent rates with automatic volume discounts, no monthly fees and no hidden costs.";

  // ---- Section renderers ---------------------------------------------------

  const SectionHeader = ({ section }) => (
    <div className="flex items-start gap-3 mb-5">
      <span className="flex-shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-third/10 text-third-dark">
        <Icon name={section.icon} />
      </span>
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-primary leading-tight">
          {section.title[lang]}
        </h3>
        {section.subtitle && (
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            {section.subtitle[lang]}
          </p>
        )}
      </div>
    </div>
  );

  const TieredSection = ({ section }) => (
    <div className="scroll-mt-28" id={section.id}>
      <SectionHeader section={section} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {section.rows.map((row, ri) => (
          <div key={ri} className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 hover:border-third/40 transition">
            <p className="font-semibold text-white mb-4">{row.label[lang]}</p>
            <div className="grid grid-cols-3 gap-2">
              {tiers.map((tier, ti) => {
                const value = tier.discount ? money(row.price * (1 - tier.discount)) : money(row.price);
                const best = ti === 2;
                return (
                  <div key={ti} className={`rounded-xl px-2 py-3 text-center ${best ? "bg-third text-white shadow-sm" : "bg-white/5"}`}>
                    <p className={`text-[10px] uppercase tracking-wide font-semibold ${best ? "text-white/80" : "text-white/40"}`}>
                      {tier.badge}
                    </p>
                    <p className={`text-lg font-bold leading-tight mt-0.5 ${best ? "text-white" : "text-white"}`}>
                      {value}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${best ? "text-white/70" : "text-white/35"}`}>
                      {tier.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-white/35 mt-3">
              {t("pricingPage.perUnitNote")} ({section.unit[lang]})
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const FlatSection = ({ section }) => (
    <div className="scroll-mt-28" id={section.id}>
      <SectionHeader section={section} />
      {section.id === "storage" && (
        <div className="rounded-2xl bg-gradient-to-r from-third to-third-dark text-white p-6 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <span className="inline-block self-start sm:self-auto bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
            {t("pricingPage.storageOfferBadge")}
          </span>
          <p className="text-white/95 text-sm sm:text-base leading-relaxed">
            {t("pricingPage.storageOfferText")}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {section.rows.map((row, ri) => {
          const isNum = typeof row.price === "number";
          return (
            <div key={ri} className="rounded-xl border border-white/10 bg-[#0d1117] px-5 py-4 flex items-center justify-between gap-4 hover:border-third/40 transition">
              <span className="text-white/75 font-medium">{row.label[lang]}</span>
              <span className="text-white font-bold text-lg whitespace-nowrap">
                {isNum ? `${money(row.price)}${row.suffix?.[lang] ?? ""}` : row.price[lang]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Seo
        title="FBA Prep & 3PL Pricing | Volume Discounts | Ecom Logistics"
        description={description}
        path="/pricing"
        lang={lang}
        schema={[
          buildServiceSchema({ name: "FBA Prep & 3PL Fulfillment Pricing", description, path: "/pricing" }),
          buildFaqSchema(faq),
        ].filter(Boolean)}
      />

      <div className="bg-white text-gray-800">
        <Navbar />

        {/* Hero — dark */}
        <section className="bg-primary text-white px-6 sm:px-8 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-block text-third font-semibold tracking-widest uppercase text-sm mb-4">
              {t("pricingPage.heroEyebrow")}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              {t("pricingPage.heroTitle")}
            </h1>
            <p className="text-gray-200 text-base sm:text-lg max-w-3xl mx-auto mb-7">
              {t("pricingPage.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href="#contact-us" className="bg-third hover:bg-third-dark text-white font-semibold px-8 py-3 rounded-xl transition duration-300">
                {t("pricingPage.ctaQuote")}
              </a>
              <a href={SITE.nap.phoneHref} className="border border-white/70 hover:bg-white hover:text-primary text-white font-semibold px-8 py-3 rounded-xl transition duration-300">
                {t("pricingPage.ctaCall")} · {SITE.nap.phone}
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {trustPills.map((pill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 text-gray-100 text-xs sm:text-sm px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5 text-third" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Volume tiers explainer — white */}
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
                <div key={i} className={`relative rounded-2xl border p-6 ${i === 2 ? "border-third bg-white shadow-lg ring-2 ring-third/30" : "border-gray-200 bg-white"}`}>
                  {i === 2 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-third text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                      {t("pricingPage.bestValue")}
                    </span>
                  )}
                  <p className="text-primary font-bold text-lg">{tier.label}</p>
                  <p className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${tier.discount ? "bg-third/15 text-third-dark" : "bg-gray-100 text-gray-600"}`}>
                    {tier.badge}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tabbed pricing — white */}
        <section className="px-6 sm:px-8 py-14 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl">
                {TABS.map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setActiveTab(tb.id)}
                    className={`px-5 sm:px-7 py-2.5 rounded-xl text-sm sm:text-base font-semibold transition duration-200 ${
                      activeTab === tb.id ? "bg-primary text-white shadow" : "text-gray-500 hover:text-primary"
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              {visibleSections.map((section) =>
                section.tiered ? <TieredSection key={section.id} section={section} /> : <FlatSection key={section.id} section={section} />
              )}

              {/* Payment processing strip */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-100 px-6 py-4">
                  <h3 className="text-primary text-lg font-bold">{paymentFees.title[lang]}</h3>
                </div>
                <div className="flex flex-col sm:flex-row">
                  {paymentFees.rows.map((row, i) => (
                    <div key={i} className="flex-1 px-6 py-4 flex items-center justify-between border-t sm:border-t-0 sm:border-l first:border-l-0 border-gray-100 bg-white">
                      <span className="text-gray-700">{row.label[lang]}</span>
                      <span className="font-semibold text-primary">{row.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's included + oversize — white */}
        <section className="px-6 sm:px-8 pb-16 bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-7">
              <h3 className="text-primary text-xl font-bold mb-4">{t("pricingPage.noteTitle")}</h3>
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
              <h3 className="text-xl font-bold mb-3 text-third">{t("pricingPage.oversizeTitle")}</h3>
              <p className="text-gray-200 leading-relaxed">{t("pricingPage.oversizeText")}</p>
            </div>
          </div>
          <p className="max-w-5xl mx-auto text-xs text-gray-400 mt-6 text-center">
            {t("pricingPage.finePrint")}
          </p>
        </section>

        {/* FAQ — light gray */}
        <section className="px-6 sm:px-8 pb-16 bg-gray-50 pt-14 border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-8">
              {t("pricingPage.faqTitle")}
            </h2>
            <div className="space-y-4">
              {faq.map((item, i) => (
                <details key={i} className="group rounded-xl bg-white border border-gray-200 p-5">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-primary list-none">
                    {item.question}
                    <span className="ml-4 text-third transition-transform group-open:rotate-45 text-2xl leading-none">+</span>
                  </summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">{item.answer}</p>
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
