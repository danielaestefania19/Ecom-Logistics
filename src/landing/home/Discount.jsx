import { Card, CardBody, CardHeader, Image } from "@heroui/react";
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import entregagratis from '../../assets/entregagratis.png';
import { useLanguage } from "../i18n/LanguageContext";

const Discount = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-primary py-16 px-4">
      <div className="max-w-7xl mx-auto flex justify-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-31 w-full">
          {/* Texto */}
          <div className="text-center md:text-left px-2 md:px-0">
            <h2 className="text-third text-2xl sm:text-3xl font-bold mb-1">
              {t("discountHeadline1")}
            </h2>
            <span className="text-white text-2xl sm:text-3xl font-bold">
              {t("discountHeadline2")}
            </span>
          </div>

          {/* Card */}
          <a href="#contact">
            <div className="w-full md:w-[300px] lg:w-[300px] xl:w-[400px] px-2 md:px-0">
              <Card
                isHoverable={true}
                classNames={{
                  base: "bg-white px-2 rounded-xl shadow-md text-center",
                }}
              >
                <CardHeader className="flex items-center justify-between gap-6 sm:gap-6 w-full flex-nowrap">
                  <div className="flex items-center gap-4 flex-1">
                    <Image height={50} src={entregagratis} width={50} />
                    <div className="flex flex-col text-left">
                      <p className="text-primary text-md font-bold">{t("discountCardTitle")}</p>
                      <p className="text-gray-500 text-sm">{t("discountCardSubtitle")}</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-primary flex-shrink-0" />
                </CardHeader>
              </Card>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Discount;
