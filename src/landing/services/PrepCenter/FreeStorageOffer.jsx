import FreeStorage from '../../../assets/FreeStorage.jpg'
import { Button } from "@heroui/react";
import PriceListPrepLTL from '../../../assets/PriceListPrep&LTL.pdf';
import { useLanguage } from "../../i18n/LanguageContext";

const FreeStorageOffer = () => {
  const { t } = useLanguage();

  return (
    <section id="free-packaging" className="bg-white py-24 px-6 bg-no-repeat bg-cover bg-center">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
          <img
            src={FreeStorage}
            alt="Warehouse"
            className="rounded-xl shadow-lg w-full max-w-xl"
          />
        </div>
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 leading-tight tracking-tight">
            {t("storage.title")}
          </h2>
          <p className="text-xl text-black mb-4">
            {t("storage.subtitle")}
          </p>
          <p className="text-lg text-black mb-8">
            {t("storage.description")}
          </p>
          <a href={PriceListPrepLTL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="text-white bg-third hover:bg-third-dark px-8 py-4 rounded-xl transition duration-300 ease-in-out"
            >
              {t("storage.button")}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FreeStorageOffer;
