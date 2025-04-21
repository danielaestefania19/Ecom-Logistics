import {
    InboxArrowDownIcon,
    MagnifyingGlassIcon,
    TagIcon,
    CubeIcon,
    TruckIcon
} from "@heroicons/react/24/solid";

const steps = [
    {
        icon: <InboxArrowDownIcon className="w-7 h-7 text-white" />,
        title: "Inventory Receiving",
        description: "We accept shipments from your suppliers, ensuring a seamless transition from manufacturer to fulfillment center.",
    },
    {
        icon: <MagnifyingGlassIcon className="w-7 h-7 text-white" />,
        title: "Product Inspection",
        description: "Each item undergoes a thorough inspection to verify quality and quantity, ensuring compliance with Amazon's standards.",
    },
    {
        icon: <TagIcon className="w-7 h-7 text-white" />,
        title: "Prep, Labeling & Packaging",
        description: "We apply FNSKU labels and securely package your products with polybagging, bubble wrapping, and bundling.",
    },
    {
        icon: <CubeIcon className="w-7 h-7 text-white" />,
        title: "Storage",
        description: "We offer short-term storage solutions, keeping your inventory organized and ready for shipment. Enjoy 7 days free!",
    },
    {
        icon: <TruckIcon className="w-7 h-7 text-white" />,
        title: "Shipping to Amazon FBA",
        description: "We manage your shipments to Amazon fulfillment centers, ensuring timely delivery, compliance and full SPD processing.",
    }
];

const Request = () => (
    <section className="py-20 px-6 bg-gray-50 font-montserrat">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-10">
            Our Logistics Process
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-200 hover:shadow-xl transition"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-third">
                            {step.icon}
                        </div>
                        <h3 className="text-md font-semibold text-primary mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-700 leading-snug">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Request;
