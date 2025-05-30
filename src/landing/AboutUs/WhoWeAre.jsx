import { useLanguage } from "../i18n/LanguageContext";
import Team from "../../assets/Team.png";

const WhoWeAre = () => {
  const { t } = useLanguage();
  const who = t("whoWeAre");

  return (
    <section className="bg-white py-24 px-6 lg:px-24">
      <div className="max-w-6xl mx-auto flex flex-col gap-12 lg:flex-row items-center">
        <div className="w-full lg:w-2/3">
          <h2 className="text-4xl font-bold text-primary mb-6 text-center lg:text-left">
            {who.title}
          </h2>
          <p className="text-lg text-third leading-relaxed mb-6 text-center lg:text-left">
            {who.paragraph1}
          </p>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed text-center lg:text-left">
            {who.paragraph2}
            <span className="font-semibold text-primary">{who.highlights.ltl}</span>,{" "}
            <span className="font-semibold text-primary">{who.highlights.fulfillment}</span>,{" "}
            <span className="font-semibold text-primary">{who.highlights.fba}</span>,{" "}
            <span className="font-semibold text-primary">{who.highlights.local}</span>
            {who.conclusion}
          </p>
        </div>
        <div className="w-full lg:w-1/3 flex justify-center mt-10 lg:mt-0">
          <img
            src={Team}
            alt="Ecom Logistics Team"
            className="rounded-xl shadow-lg w-full max-w-xs"
          />
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
