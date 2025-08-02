import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button
} from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "../i18n/LanguageContext";
import logistica from '../../assets/logistica.png';
import camion from '../../assets/camion.png';
import amazon from '../../assets/amazon.png';
import tiktok from '../../assets/tiktok.png';
import storege from '../../assets/storage.png';
import localmoving from '../../assets/localmoving.png';
import telefono from '../../assets/telefono.png';
import flecha from '../../assets/flecha.png';

const Services = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleNavigate = (path) => () => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const routes = {
    amazonPartner: '/amazon-freight-partner-shipping',
    prepCenter: '/prep-center',
    tiktokShop: '/3pl-services',
    storageAnchor: '/3pl-services#free-packaging',
    localMovingAnchor: '/amazon-freight-partner-shipping#local-moving',
  };

  return (
    <section id="services" className="w-full py-20 px-6 md:px-20 bg-white">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start w-full mb-12 gap-8">
          <div className="w-full lg:w-2/3">
            <h2 className="text-4xl md:text-6xl font-normal mb-2">
              {t("servicesTitle1")}
            </h2>
            <h2 className="text-4xl md:text-6xl font-normal mb-2">
              {t("servicesTitle2")}
            </h2>
          </div>
          <div className="w-full lg:w-1/3 mt-4 flex flex-col gap-4 text-left">
            <p className="text-third text-sm leading-relaxed">
              {t("servicesDesc")}
            </p>
            <div className="flex gap-3 justify-center">
              <a href="#contact">
                <Button
                  radius="full"
                  className="px-4 py-2 text-sm md:text-sm text-white bg-blue hover:bg-white-100 font-semibold"
                >
                  <img src={telefono} alt="Phone Icon" className="w-4 h-4" /> {t("contactUs")}
                </Button>
              </a>
              <a href="#services">
                <Button
                  radius="full"
                  className="px-4 py-2 text-sm md:text-sm text-white bg-blue  hover:bg-white-100 font-semibold"
                >
                  {t("servicesAll")}
                  <img src={flecha} alt="All Service" className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={camion} alt="LTL" className="rounded-md bg-white w-8 h-8 xl:w-9 xl:h-9" />
              <h3 className="text-lg font-semibold">{t("ltlTitle")}</h3>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              <p>{t("ltlDesc")}</p>
            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate(routes.amazonPartner)}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                {t("learnMore")}
              </span>
            </CardFooter>
          </Card>
          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={amazon} alt="FBA Prep Center" className="rounded-md bg-white p-1 w-10 h-10 xl:w-12 xl:h-12" />
              <h3 className="text-lg font-semibold">{t("fbaTitle")}</h3>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              <p> {t("fbaDesc")} </p>
            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate(routes.prepCenter)}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                {t("learnMore")}
              </span>
            </CardFooter>
          </Card>
          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={tiktok} alt="TikTok Shop 3PL" className="rounded-md bg-white p-1 w-12 h-12 xl:w-10 xl:h-10" />
              <h3 className="text-lg font-semibold">{t("tiktokTitle")}</h3>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              <p>{t("tiktokDesc")}</p>
            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate(routes.tiktokShop)}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                {t("learnMore")}
              </span>
            </CardFooter>
          </Card>
          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={storege} alt="Storage" className="rounded-md bg-white p-1 w-8 h-8 xl:w-10 xl:h-10" />
              <h3 className="text-lg font-semibold">{t("storageTitle")}</h3>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              <p> {t("storageDesc")} </p>
            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate(routes.storageAnchor)}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                {t("learnMore")}
              </span>
            </CardFooter>
          </Card>
          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={localmoving} alt="Local Moving" className="rounded-md bg-white p-1 w-8 h-8 xl:w-10 xl:h-10" />
              <h3 className="text-lg font-semibold">{t("localTitle")}</h3>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              <p>{t("localDesc")}</p>
            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate(routes.localMovingAnchor)}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                {t("learnMore")}
              </span>
            </CardFooter>
          </Card>
          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={logistica} alt="Brand Management" className="rounded-md bg-white p-1 w-8 h-8 xl:w-10 xl:h-10" />
              <h3 className="text-lg font-semibold">{t("brandTitle")}</h3>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              <p> {t("brandDesc")} </p>
            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                {t("comingSoon")}
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;
