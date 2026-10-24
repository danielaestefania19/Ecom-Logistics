import { Link } from "react-router-dom";
import { useT } from "../i18n";

// 3PL still runs on its Asana form until phase 2 brings inventory into the portal.
const THREE_PL_FORM_URL = "https://form.asana.com/?k=nxer9v8txHc7yV4FbS8KdQ&d=1210257610652957";

const ctaCls =
  "mt-6 inline-flex items-center justify-center gap-2 bg-primary hover:bg-third text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition duration-200";

const ServiceCard = ({ badge, title, subtitle, description, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:border-third/50 hover:shadow-md transition duration-200">
    <span className="self-start text-[11px] font-bold uppercase tracking-wide text-third bg-third/10 px-2.5 py-1 rounded-full mb-4">{badge}</span>
    <h2 className="text-primary font-bold text-lg mb-0.5">{title}</h2>
    <p className="text-third text-xs font-medium mb-3">{subtitle}</p>
    <p className="text-gray-500 text-sm leading-relaxed flex-1">{description}</p>
    {children}
  </div>
);

const ServiceRequest = () => {
  const { t } = useT();
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">{t("services.title")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("services.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ServiceCard badge="FBA" title={t("services.prep.title")} subtitle={t("services.prep.subtitle")} description={t("services.prep.description")}>
          <Link to="/portal/orders/new" className={ctaCls}>{t("services.prep.cta")} →</Link>
        </ServiceCard>
        <ServiceCard badge="3PL" title={t("services.threePl.title")} subtitle={t("services.threePl.subtitle")} description={t("services.threePl.description")}>
          <a href={THREE_PL_FORM_URL} target="_blank" rel="noopener noreferrer" className={ctaCls}>
            {t("services.threePl.cta")} ↗
          </a>
        </ServiceCard>
      </div>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
        <p className="text-gray-600 text-sm">
          {t("services.help")}{" "}
          <a href="tel:+13412089445" className="text-third font-medium hover:underline">+1 (341) 208-9445</a>
          {" · "}
          <a href="mailto:sales@ecomlogisticsus.com" className="text-third font-medium hover:underline">sales@ecomlogisticsus.com</a>
        </p>
      </div>
    </div>
  );
};

export default ServiceRequest;
