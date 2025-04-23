import {
    TruckIcon,
    GlobeAmericasIcon,
    ClockIcon,
    WrenchScrewdriverIcon,
    UserGroupIcon,
    HandRaisedIcon,
} from '@heroicons/react/24/outline';

const features = [
    {
        title: 'Strategic Location in California',
        description:
            'Our proximity to major ports and suppliers ensures faster delivery times and seamless coordination, keeping your inventory flowing smoothly.',
        icon: GlobeAmericasIcon,
    },
    {
        title: 'Industry Expertise',
        description:
            'With years of experience in the e-commerce and logistics industries, we understand the unique challenges you face. We know how to optimize your supply chain for efficiency and cost savings.',
        icon: WrenchScrewdriverIcon,
    },
    {
        title: 'Reliable and Timely Service',
        description:
            'We’re committed to fast turnarounds and clear communication. When you need something done, we get it done – on time, every time.',
        icon: ClockIcon,
    },
    {
        title: 'Customized Solutions',
        description:
            'Every business is different, which is why we tailor our services to fit your specific needs. Whether you’re managing a few shipments or a large-scale operation, we’ve got you covered.',
        icon: TruckIcon,
    },
    {
        title: 'End-to-End Logistics Support',
        description:
            'From warehousing to fulfillment, shipping, and everything in between, we handle the entire logistics process so you can focus on growing your business.',
        icon: UserGroupIcon,
    },
    {
        title: 'Personalized Customer Support',
        description:
            'We’re always here for you, offering responsive and knowledgeable support whenever you need it. You’re not just a number – you’re a valued partner.',
        icon: HandRaisedIcon,
    },
];

const WhyEcomLogistics = () => {
    return (
        <section className="bg-primary text-white py-20 px-6 md:px-20">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Why Ecom Logistics?
                </h2>
                <p className="text-lg text-gray-300 mb-12">
                    At Ecom Logistics, we don’t just provide logistics services — we become your strategic partner in growth. Here’s why choosing us makes all the difference:
                </p>

                <div className="grid md:grid-cols-2 gap-10 text-left">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="flex items-start gap-4">
                                <div className="bg-third text-white p-3 rounded-xl shadow-md">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                                    <p className="text-gray-400 mt-1">{feature.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12">
                    <p className="mt-8 text-lg font-medium">
                        When you work with Ecom Logistics, you get more than just a logistics provider — you get a dedicated team focused on your business’s success.
                    </p>
                    <p className="text-gray-300 mt-4 text-lg">
                        Ready to see the difference? Contact us today and let us show you how we can take your logistics to the next level!
                    </p>
                    <div className="mt-6">
                        <button
                            className="bg-third text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-orange-500 transition-all duration-300"
                        >
                            Contact us today!
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyEcomLogistics;
