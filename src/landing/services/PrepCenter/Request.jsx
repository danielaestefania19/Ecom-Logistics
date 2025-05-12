import {
    InboxArrowDownIcon,
    MagnifyingGlassIcon,
    TagIcon,
    CubeIcon,
    TruckIcon,
    DocumentMagnifyingGlassIcon
  } from "@heroicons/react/24/solid";
  
  const steps = [
    {
      icon: <InboxArrowDownIcon className="w-7 h-7 text-white" />,
      title: "Inventory Receiving",
      description:
        "We accept shipments from your suppliers, ensuring a seamless transition from manufacturer to fulfillment center."
    },
    {
      icon: <MagnifyingGlassIcon className="w-7 h-7 text-white" />,
      title: "Product Inspection",
      description:
        "Each item undergoes a thorough inspection to verify quality and quantity, ensuring compliance with Amazon's standards."
    },
    {
      icon: <TagIcon className="w-7 h-7 text-white" />,
      title: "Prep, Labeling & Packaging",
      description:
        "We apply FNSKU labels and securely package your products with polybagging, bubble wrapping, and bundling."
    },
    {
      icon: <CubeIcon className="w-7 h-7 text-white" />,
      title: "Storage",
      description:
        "We offer short-term storage solutions, keeping your inventory organized and ready for shipment. Enjoy 7 days free!"
    },
    {
      icon: <TruckIcon className="w-7 h-7 text-white" />,
      title: "Shipping to Amazon FBA",
      description:
        "We manage your shipments to Amazon fulfillment centers, ensuring timely delivery, compliance and full SPD or LTL processing."
    },
    {
      icon: <DocumentMagnifyingGlassIcon className="w-7 h-7 text-white" />,
      title: "Compliance Documentation",
      description:
        "We handle all necessary documentation to ensure your products meet Amazon FBA requirements and international shipping standards."
    }
  ];
  
  const Request = () => (
    <section className="py-20 px-6 bg-primary font-montserrat text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Our Logistics Process
        </h2>
        <p className="text-center text-gray-300 mb-12 max-w-3xl mx-auto">
          At Ecom Logistics, we don’t just provide logistics services — we become your strategic partner in growth.
        </p>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 bg-[#1e232d] rounded-xl p-6 border border-gray-700 shadow hover:shadow-lg transition"
            >
              <div className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full bg-blue-600">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
  
        <p className="mt-12 text-center text-gray-300 font-medium">
          Ready to see the difference? Contact us today and let us show you how we can take your logistics to the next level!
        </p>
      </div>
    </section>
  );
  
  export default Request;
  