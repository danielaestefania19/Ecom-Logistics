import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button
} from "@heroui/react";
import { useNavigate } from 'react-router-dom';
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

  const handleNavigate = (path) => () => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <section id="services" className="w-full py-20 px-6 md:px-20 bg-white">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start w-full mb-12 gap-8">
          <div className="w-full lg:w-2/3">
            <h1 className="text-4xl md:text-6xl font-normal mb-2">
              <span className="text-third">Our Offerings: </span> Making Your
            </h1>
            <h1 className="tracking-tight font-normal text-primary text-4xl lg:text-6xl bg-clip-text">
              Move Effortless
            </h1>
          </div>
          <div className="w-full lg:w-1/3 mt-4 flex flex-col gap-4 text-left">
            <p className="text-third text-sm leading-relaxed">
              We provide tailored logistics and fulfillment solutions for Amazon FBA, TikTok Shop, and local businesses. From warehousing to last-mile delivery, we ensure your operations run smoothly and your brand grows with confidence.
            </p>
            <div className="flex gap-3 justify-center">
              <a href="#contact">
                <Button
                  radius="full"
                  className="px-4 py-2 text-sm md:text-sm text-white bg-blue hover:bg-white-100 font-semibold"
                >
                  <img src={telefono} alt="Phone Icon" className="w-4 h-4" /> Contact Us
                </Button>
              </a>
              <a href="#services">
                <Button
                  radius="full"
                  className="px-4 py-2 text-sm md:text-sm text-white bg-blue bg-opacity-85 hover:bg-white-100 font-semibold"
                >
                  All Service
                  <img src={flecha} alt="All Service" className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={camion} alt="LTL" className="rounded-md bg-white w-8 h-8 xl:w-9 xl:h-9" />
              <p className="text-lg font-semibold">Amazon Partner (LTL & FTL)</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              As your logistics partner for LTL and FTL, we offer the most competitive rates in the market along with fast delivery to Amazon Fulfillment Centers, saving you time and money without compromising quality. We help you avoid low inventory fees and keep your stock moving efficiently.    </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate('/Amazon Partner')}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                Learn More
              </span>
            </CardFooter>
          </Card>

          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={amazon} alt="FBA Prep Center" className="rounded-md bg-white p-1 w-10 h-10 xl:w-12 xl:h-12" />
              <p className="text-lg font-semibold">FBA Prep Center</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              Specialized in preparing, labeling, bundling, and shipping inventory to Amazon warehouses, ensuring full compliance with FBA standards.
            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate('/prepservices')}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                Learn More
              </span>
            </CardFooter>
          </Card>

          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={tiktok} alt="TikTok Shop 3PL" className="rounded-md bg-white p-1 w-12 h-12 xl:w-10 xl:h-10" />
              <p className="text-lg font-semibold">3PL (TikTok Shop & Amazon)</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              Let us manage your brand like the pros. At Ecom Logistics, we support both new and established brands by managing every aspect of your online presence, from product launches, to logistics and shipping.     </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate('/TikTok')}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                Learn More
              </span>
            </CardFooter>
          </Card>

          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={storege} alt="Storage" className="rounded-md bg-white p-1 w-8 h-8 xl:w-10 xl:h-10" />
              <p className="text-lg font-semibold">Storage Service</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              Looking for secure storage for your products? Our warehouse has the space you need to keep your inventory safe and organized. Try us out! All customers get First 7 days of free storage.            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate('/TikTok#free-packaging')}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                Learn More
              </span>
            </CardFooter>
          </Card>

          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={localmoving} alt="Local Moving" className="rounded-md bg-white p-1 w-8 h-8 xl:w-10 xl:h-10" />
              <p className="text-lg font-semibold">Local Moving</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              We’ve got your local moves covered! If you need to pick up goods from your supplier or make local deliveries in California (LTL or SPD), our fleet and logistics partners make it easy and worry-free.
            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                onClick={handleNavigate('/Amazon Partner#local-moving')}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                Learn More
              </span>
            </CardFooter>
          </Card>

          <Card className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={logistica} alt="Brand Management" className="rounded-md bg-white p-1 w-8 h-8 xl:w-10 xl:h-10" />
              <p className="text-lg font-semibold">Brand Management</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              At Ecom Logistics, we provide end-to-end Brand Management solutions to boost your visibility and market impact. Our process includes brand discovery, strategy development, visual identity creation and ongoing performance monitoring, ensuring your brand remains consistent, recognizable and ready to grow.
            </CardBody>
            <div className="relative w-full h-5 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <span
                //onClick={handleNavigate('/Brand Management')}
                role="button"
                tabIndex={0}
                className="text-sm text-third hover:underline font-semibold cursor-pointer"
              >
                Coming Soon
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;
