import {
  PhoneIcon,
  TruckIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  InboxArrowDownIcon
} from "@heroicons/react/24/solid";

const steps = [
  {
    icon: <PhoneIcon className="w-10 h-10 text-white" />,
    title: "STEP 1",
    description: "Contact us to get a free quote and create an account with us!"
  },
  {
    icon: <BuildingStorefrontIcon className="w-10 h-10 text-white" />,
    title: "STEP 2",
    description: "Get your LTL or FTL shipment ready, prepare your pallets with our advisory."
  },
  {
    icon: <CurrencyDollarIcon className="w-10 h-10 text-white" />,
    title: "STEP 3",
    description: "Coordinate the payment with our dedicated team."
  },
  {
    icon: <TruckIcon className="w-10 h-10 text-white" />,
    title: "STEP 4",
    description: "Get in touch with us to arrange a free pickup or delivery in San Francisco and Bay Area."
  },
  {
    icon: <InboxArrowDownIcon className="w-10 h-10 text-white" />,
    title: "STEP 5",
    description: "Your merchandise will reach the Amazon fulfillment center within 2 to 3 days from the date of shipment."
  }
];

const Pricing = () => (
  <section className="py-20 px-6 bg-gray-50 font-montserrat">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-10">
        Steps to Request an LTL or FTL Service
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-200 hover:shadow-xl transition"
          >
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-primary">
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

export default Pricing;
