import ThirdParty from '../../../assets/ThirdParty.png';
import { Button } from "@heroui/react";
import { useLanguage } from "../../i18n/LanguageContext";

const Header = () => {
    const { t } = useLanguage();

    return (
        <div className="relative w-full min-h-[85vh] flex flex-col md:flex-row bg-primary text-white overflow-hidden font-montserrat">
            <div className="relative z-10 w-full md:w-3/5 px-6 sm:px-10 md:px-20 lg:px-32 py-20 flex flex-col justify-center text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
                    {t("tiktokShop.header.title")} <span className="text-third">{t("tiktokShop.header.highlight")}</span>
                </h1>

                <p className="text-xl md:text-2xl font-medium text-white/90 mb-6">
                    {t("tiktokShop.header.subtitle")}
                </p>

                <p className="text-base md:text-lg text-white/80 font-light leading-relaxed mb-4">
                    {t("tiktokShop.header.description")}
                </p>
                <a href="#contact" className=" inline-block">
                    <Button
                        radius="full"
                        className="px-6 py-6 text-lg md:text-xl text-white bg-third hover:bg-white-100 font-semibold mt-8"
                    >
                        {t("tiktokShop.header.cta")}
                    </Button>
                </a>
            </div>
            <div
                className="absolute top-0 right-0 h-full w-3/5 hidden md:block"
                style={{
                    backgroundImage: `
          linear-gradient(
            to right,
            rgba(7, 10, 15, 1) 0%,
            rgba(7, 10, 15, 0.8) 10%,
            rgba(7, 10, 15, 0.2) 40%,
            rgba(7, 10, 15, 0) 50%,
            rgba(7, 10, 15, 0.2) 60%,
            rgba(7, 10, 15, 0.8) 90%,
            rgba(7, 10, 15, 1) 100%
          ),
          url(${ThirdParty})
        `,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />
            <div className="w-full h-full md:hidden relative">
                <img
                    src={ThirdParty}
                    alt="Truck delivering for Amazon"
                    className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-primary" />
            </div>
        </div>
    );
};

export default Header;
