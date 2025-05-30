import AdvantagesTiktok from '../../../assets/AdvantagesTiktok.jpg';
import { useLanguage } from "../../i18n/LanguageContext";

const Advantages = () => {
    const { t } = useLanguage();

    return (
        <section className="bg-white py-24 px-6  bg-no-repeat bg-cover bg-center">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
                    <img
                        src={AdvantagesTiktok}
                        alt="AdvantagesTiktok"
                        className="rounded-xl shadow-lg w-full max-w-xl"
                    />
                </div>
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
                    <div className="bg-primary rounded-2xl shadow-2xl p-10 text-center lg:text-left flex flex-col gap-6 max-w-xl transition-transform duration-300 hover:scale-105">
                        <h2 className="text-2xl md:text-3xl font-bold text-third leading-tight tracking-tight">
                            {t("tiktokShopAdvantages.title")}
                        </h2>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-white leading-tight">
                                {t("tiktokShopAdvantages.metric1.value")}
                            </span>
                            <span className="text-base text-white opacity-80">
                                {t("tiktokShopAdvantages.metric1.description")}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-white leading-tight">
                                {t("tiktokShopAdvantages.metric2.value")}
                            </span>
                            <span className="text-base text-white opacity-80">
                                {t("tiktokShopAdvantages.metric2.description")}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-white leading-tight">
                                {t("tiktokShopAdvantages.metric3.value")}
                            </span>
                            <span className="text-base text-white opacity-80">
                                {t("tiktokShopAdvantages.metric3.description")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Advantages;
