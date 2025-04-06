import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Image,
} from "@heroui/react";
import team from '../../assets/team.png'
import support from '../../assets/support.png'
import competitive from '../../assets/competitive.png'
import { ArrowRight } from "lucide-react";


const WhyEcom = () => {

    return (
        <section className="w-full py-20 px-6 md:px-20 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex lg:flex-row justify-center items-center w-full mb-12 gap-8">
                    <div className="w-full">
                        <h1 className="text-4xl md:text-6xl font-semibold mb-2">
                            ¿Why choose Ecom Logistics?
                        </h1>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-gray-200 p-6 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                        <CardHeader className="flex flex-col items-start gap-1">
                            <Image src={team} alt="Top Team" className="w-20 h-20 rounded-md mb-1" />
                            <p className="text-2xl font-semibold text-primary">Top Team</p>
                        </CardHeader>

                        <CardBody className="text-gray-700 text-[16px]">
                            Our expert team brings years of logistics experience, ensuring your products move efficiently, safely, and on time—every single time.
                        </CardBody>
                        <CardFooter>
                            <a
                                href="#"
                                className="text-sm text-third hover:underline font-semibold inline-flex items-center"
                            >
                                Learn More
                                <ArrowRight className="w-6 h-4" />
                            </a>
                        </CardFooter>
                    </Card>
                    <Card className="bg-gray-200 p-6 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                        <CardHeader className="flex flex-col items-start gap-1">
                            <Image src={support} alt="Customer Support" className="w-20 h-20 rounded-md mb-1" />
                            <p className="text-2xl font-semibold text-primary">Customer Support</p>
                        </CardHeader>
                        <CardBody className="text-gray-700 text-[16px]">
                            We pride ourselves on 24/7 customer service. Our support specialists are always ready to help you solve issues and keep your operations running smoothly.       </CardBody>
                        <CardFooter>
                            <a href="#" className="text-sm text-third hover:underline font-semibold inline-flex items-center">
                            Learn More
                            <ArrowRight className="w-6 h-4" />
                            </a>
                        </CardFooter>
                    </Card>
                    <Card className="bg-gray-200 p-6 flex flex-col justify-between rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
                        <CardHeader className="flex flex-col items-start gap-2">
                            <Image src={competitive} alt="Competitive Rates" className="w-16 h-16 rounded-md mb-3" />
                            <p className="text-2xl font-semibold text-primary">Competitive Rates</p>
                        </CardHeader>
                        <CardBody className="text-gray-700 text-[16px]">
                            Get the best value without compromising on service quality. Our competitive pricing helps you maximize profits and reduce logistics costs.
                        </CardBody>
                        <CardFooter>
                            <a href="#" className="text-sm text-third hover:underline font-semibold inline-flex items-center">
                            Learn More
                            <ArrowRight className="w-6 h-4" />
                            </a>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    )
}

export default WhyEcom;
