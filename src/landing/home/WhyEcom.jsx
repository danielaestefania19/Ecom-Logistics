import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Image,
  } from "@heroui/react";
  import top from "../../assets/top.png";
  import support from "../../assets/support.png";
  import competitive from "../../assets/competitive.png";
  import { ArrowRight } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  import { useLanguage } from "../i18n/LanguageContext";
  
  const WhyEcom = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
  
    const handleNavigate = (path) => () => {
      navigate(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  
    return (
      <section className="w-full py-20 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex lg:flex-row justify-center items-center w-full mb-12 gap-8">
            <div className="w-full">
              <h1 className="text-4xl md:text-6xl font-normal mb-2">
                {t("whyEcomTitle")} <span className="text-third">Logistics</span>?
              </h1>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 */}
            <Card className="bg-primary/5 p-6 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
              <CardHeader className="flex flex-col items-start gap-1">
                <Image
                  src={top}
                  alt="Top LTL and Prep Rates"
                  className="w-14 h-14 xl:w-20 xl:h-20 rounded-md mb-1 object-cover aspect-square"
                />
                <p className="text-2xl font-semibold text-primary">
                  {t("whyEcomCard1Title")}
                </p>
              </CardHeader>
              <CardBody className="text-blue/80 text-[16px]">
                {t("whyEcomCard1Text")}
              </CardBody>
              <CardFooter>
                <a
                  onClick={handleNavigate("/aboutus")}
                  className="text-sm text-third hover:underline font-semibold inline-flex items-center"
                >
                  {t("learnMore")}
                  <ArrowRight className="w-6 h-4 ml-1" />
                </a>
              </CardFooter>
            </Card>
  
            {/* Card 2 */}
            <Card className="bg-primary/5 p-6 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
              <CardHeader className="flex flex-col items-start gap-1">
                <Image
                  src={support}
                  alt="Customer Support and Advisors"
                  className="w-14 h-14 xl:w-20 xl:h-20 rounded-md mb-1 object-cover aspect-square"
                />
                <p className="text-2xl font-semibold text-primary">
                  {t("whyEcomCard2Title")}
                </p>
              </CardHeader>
              <CardBody className="text-blue/80 text-[16px]">
                {t("whyEcomCard2Text")}
              </CardBody>
              <CardFooter>
                <a
                  onClick={handleNavigate("/aboutus")}
                  className="text-sm text-third hover:underline font-semibold inline-flex items-center"
                >
                  {t("learnMore")}
                  <ArrowRight className="w-6 h-4 ml-1" />
                </a>
              </CardFooter>
            </Card>
  
            {/* Card 3 */}
            <Card className="bg-primary/5 p-6 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
              <CardHeader className="flex flex-col items-start gap-2">
                <Image
                  src={competitive}
                  alt="Efficiency Guaranteed"
                  className="w-14 h-14 xl:w-20 xl:h-20 rounded-md mb-1 object-cover aspect-square"
                />
                <p className="text-2xl font-semibold text-primary">
                  {t("whyEcomCard3Title")}
                </p>
              </CardHeader>
              <CardBody className="text-blue/80 text-[16px]">
                {t("whyEcomCard3Text")}
              </CardBody>
              <CardFooter>
                <a
                  onClick={handleNavigate("/aboutus")}
                  className="text-sm text-third hover:underline font-semibold inline-flex items-center"
                >
                  {t("learnMore")}
                  <ArrowRight className="w-6 h-4 ml-1" />
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    );
  };
  
  export default WhyEcom;
  