import LogoPrincipal2 from "../../assets/LogoPrincipal2.png";
import facebook from "../../assets/facebook.png";
import instagram from "../../assets/instagram.png";
import tiktokicono from "../../assets/tiktokicono.png";
import PriceList from "../../assets/PriceList.pdf";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleNavigate = (path) => () => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-8 pt-10 pb-6 flex justify-center md:justify-start">
        <img src={LogoPrincipal2} alt="e-com LOGISTICS" className="h-12" />
      </div>
      <div className="flex justify-center">
        <div className="border-t border-slate-600 w-3/4" />
      </div>
      <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row justify-end">
        <div className="w-full md:w-1/2 flex flex-col sm:flex-row flex-wrap gap-y-10 gap-x-12 text-sm items-start justify-start text-left sm:justify-between sm:text-left">
          <div className="w-full sm:w-auto">
            <h4 className="font-semibold mb-3">{t("footerInformation")}</h4>
            <ul className="space-y-1">
              <li>
                <a
                  onClick={() => {
                    navigate("/home");
                    setTimeout(() => {
                      const target = document.getElementById("services");
                      if (target) {
                        target.scrollIntoView({ behavior: "smooth" });
                      }
                    }, 100);
                  }}
                  className="cursor-pointer"
                >
                  {t("footerServices")}
                </a>
              </li>
              <li>
                <a href={PriceList} target="_blank" rel="noopener noreferrer">
                  {t("footerPricing")}
                </a>
              </li>
              <li>
                <a onClick={handleNavigate("/about-us")} className="cursor-pointer">
                  {t("footerAbout")}
                </a>
              </li>
            </ul>
          </div>
          <div className="w-full sm:w-auto">
            <h4 className="font-semibold mb-3">{t("footerContact")}</h4>
            <p className="leading-relaxed">
              25509 Industrial<br />
              Blvd, Hayward CA<br />
              94545 Suite E3<br />
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <h4 className="font-semibold mb-3">{t("footerFindUs")}</h4>
            <div className="flex justify-start gap-4 mt-2">
              <a
                href="https://www.facebook.com/ecomlogistics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <img src={facebook} alt="Facebook" className="h-8" />
              </a>
              <a
                href="https://www.instagram.com/ecomlogistics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <img src={instagram} alt="Instagram" className="h-8" />
              </a>
              <a
                href="https://www.tiktok.com/@ecomlogistics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <img src={tiktokicono} alt="TikTok" className="h-8" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="border-t border-slate-600 w-3/4" />
      </div>
      <div className="text-center text-xs py-6">
        ©2023 camps. {t("footerRights")}
      </div>
    </footer>
  );
}
