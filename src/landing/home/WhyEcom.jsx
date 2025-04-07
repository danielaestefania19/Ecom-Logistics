import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Image,
} from "@heroui/react";
import top from '../../assets/top.png';
import support from '../../assets/support.png';
import competitive from '../../assets/competitive.png';
import { ArrowRight } from "lucide-react";

const WhyEcom = () => {
    return (
        <section className="w-full py-20 px-6 md:px-20 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex lg:flex-row justify-center items-center w-full mb-12 gap-8">
                    <div className="w-full">
                        <h1 className="text-4xl md:text-6xl font-normal mb-2">
                            Why Ecom <span className="text-third">Logistics</span>?
                        </h1>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-primary/5 p-6 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                        <CardHeader className="flex flex-col items-start gap-1">
                            <Image
                                src={top}
                                alt="Top LTL and Prep Rates"
                                className="w-14 h-14 xl:w-20 xl:h-20 rounded-md mb-1 object-cover aspect-square"
                                />
                            <p className="text-2xl font-semibold text-primary">
                               1# LTL & Prep Rates
                            </p>
                        </CardHeader>
                        <CardBody className="text-blue/80 text-[16px]">
                        Save More with the Leading LTL and Prep Rates in Northern California
                        Increase your margins with Ecom Logistics' exceptional pricing. Our LTL and prep rates are the most competitive in Northern California, tailored for e-commerce sellers' needs. With our affordable options, you'll save on every shipment without sacrificing quality.      
                        </CardBody>
                       <CardFooter>
                            <a
                                href="#"
                                className="text-sm text-third hover:underline font-semibold inline-flex items-center"
                            >
                                Learn More
                                <ArrowRight className="w-6 h-4 ml-1" />
                            </a>
                        </CardFooter>
                    </Card>

                    <Card className="bg-primary/5  p-6 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                        <CardHeader className="flex flex-col items-start gap-1">
                            <Image
                                src={support}
                                alt="Customer Support and Advisors"
                                className="w-14 h-14 xl:w-20 xl:h-20 rounded-md mb-1 object-cover aspect-square"
                            />
                            <p className="text-2xl font-semibold text-primary">
                                Expert Support & Advisors
                            </p>
                        </CardHeader>
                        <CardBody className="text-blue/80 text-[16px]">
                        At Ecom Logistics, we have 5 years of experience in the logistics industry. Our trained team is here to offer you advice and support at every stage of the process, from the initial pricing inquiry to the completion of your order, ensuring a smooth and hassle-free experience.      
                        </CardBody>
                        <CardFooter>
                            <a
                                href="#"
                                className="text-sm text-third hover:underline font-semibold inline-flex items-center"
                            >
                                Learn More
                                <ArrowRight className="w-6 h-4 ml-1" />
                            </a>
                        </CardFooter>
                    </Card>

                    <Card className="bg-primary/5 p-6 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                        <CardHeader className="flex flex-col items-start gap-2">
                            <Image
                                src={competitive}
                                alt="Efficiency Guaranteed"
                                className="w-14 h-14 xl:w-20 xl:h-20 rounded-md mb-1 object-cover aspect-square"
                                />
                            <p className="text-2xl font-semibold text-primary">
                             Efficiency Guaranteed
                            </p>
                        </CardHeader>
                        <CardBody className="text-blue/80 text-[16px]">
                        We are committed to delivering fast and efficient service every time. With a highly trained team, we guarantee that your shipments are handled swiftly and without delays, meeting deadlines and ensuring quality at every stage of the process.        </CardBody>
                        <CardFooter>
                            <a
                                href="#"
                                className="text-sm text-third hover:underline font-semibold inline-flex items-center"
                            >
                                Learn More
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
