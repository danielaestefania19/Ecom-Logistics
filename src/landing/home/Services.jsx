import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button
} from "@heroui/react";
import logistica from '../../assets/logistica.png'
import camion from '../../assets/camion.png'
import amazon from '../../assets/amazon.png'
import tiktok from '../../assets/tiktok.png'
import storege from '../../assets/storage.png'
import localmoving from '../../assets/localmoving.png'
import telefono from '../../assets/telefono.png'
import flecha from '../../assets/flecha.png'

const Services = () => {
  return (
    <section className="w-full py-20 px-6 md:px-20 bg-white">
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
              <Button
                radius="full"
                className="px-4 py-2 text-sm md:text-sm text-white bg-blue hover:bg-white-100 font-semibold"
              >
                <img src={telefono} alt="Phone Icon" className="w-4 h-4" /> Contact Us
              </Button>
              <Button
                radius="full"
                className="px-4 py-2 text-sm md:text-sm text-white bg-blue bg-opacity-85 hover:bg-white-100 font-semibold">
                All Service 
                <img src={flecha} alt=" All Service " className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card  className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={camion} width={40} height={40} alt="LTL" className="rounded-md" />
              <p className="text-lg font-semibold">Amazon Partner (LTL)</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              We provide comprehensive logistics and transportation services, including freight coordination, route optimization, and last-mile delivery to ensure efficiency and reliability at every stage.
            </CardBody>
            <div className="relative w-full h-5 my-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <a href="#" className="text-sm text-third hover:underline font-semibold">Learn More</a>
            </CardFooter>
          </Card>
          <Card  className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
          <CardHeader className="flex gap-3 items-center">
              <Image src={amazon} width={50} height={50} alt="FBA Prep Center" className="rounded-md" />
              <p className="text-lg font-semibold">FBA Prep Center</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              Specialized in preparing, labeling, bundling, and shipping inventory to Amazon warehouses, ensuring full compliance with FBA standards and faster turnaround times.
            </CardBody>
            <div className="relative w-full h-5 my-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <a href="#" className="text-sm text-third hover:underline font-semibold">Learn More</a>
            </CardFooter>
          </Card>
          <Card  className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={tiktok} width={40} height={40} alt="TikTok Shop 3PL" className="rounded-md" />
              <p className="text-lg font-semibold">TikTok Shop (3PL)</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              Empower your TikTok Shop with our third-party logistics solutions—covering order fulfillment, packaging, and real-time tracking to help you scale and ship with confidence.
            </CardBody>
            <div className="relative w-full h-5 my-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <a href="#" className="text-sm text-third hover:underline font-semibold">Learn More</a>
            </CardFooter>
          </Card>
          <Card  className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
          <CardHeader className="flex gap-3 items-center">
              <Image src={storege} width={40} height={40} alt="Storage" className="rounded-md" />
              <p className="text-lg font-semibold">Storage Service</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              Secure and scalable storage facilities with 24/7 surveillance, real-time inventory systems, and custom solutions for seasonal or long-term warehousing needs.
            </CardBody>
            <div className="relative w-full h-5 my-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <a href="#" className="text-sm text-third hover:underline font-semibold">Learn More</a>
            </CardFooter>
          </Card>
          <Card  className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={localmoving} width={40} height={40} alt="Local Moving" className="rounded-md" />
              <p className="text-lg font-semibold">Local Moving</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              Professional local moving services tailored for residential and commercial clients. We handle everything from packing and loading to delivery with care and precision.
            </CardBody>
            <div className="relative w-full h-5 my-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <a href="#" className="text-sm text-third hover:underline font-semibold">Learn More</a>
            </CardFooter>
          </Card>
          <Card  className="bg-white p-6 min-h-[320px] flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <CardHeader className="flex gap-3 items-center">
              <Image src={logistica} width={40} height={40} alt="Brand Management" className="rounded-md" />
              <p className="text-lg font-semibold">Brand Management</p>
            </CardHeader>
            <CardBody className="text-blue/80 text-[16px]">
              We help e-commerce brands manage their presence across platforms with tailored strategies, performance analytics, and reputation control to drive sustainable growth.
            </CardBody>
            <div className="relative w-full h-5 my-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-200" />
              <div className="absolute left-0 w-2 h-2 bg-gray-200 rounded-full" />
              <div className="absolute right-0 w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <CardFooter>
              <a href="#" className="text-sm text-third hover:underline font-semibold">Learn More</a>
            </CardFooter>
          </Card>

        </div>
      </div>
    </section>
  );
};

export default Services;
