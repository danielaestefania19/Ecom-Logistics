import { Truck, Warehouse, Box, Move } from 'lucide-react'; // puedes usar otros íconos si prefieres

const services = [
  {
    title: "Amazon LTL Shipping",
    description:
      "Fast, reliable, and cost-effective, ensuring your products reach Amazon’s fulfillment centers on time.",
    icon: <Truck className="w-8 h-8 text-primary" />,
  },
  {
    title: "3PL Fulfillment",
    description:
      "End-to-end logistics management, from storage to order fulfillment, giving you peace of mind.",
    icon: <Warehouse className="w-8 h-8 text-primary" />,
  },
  {
    title: "Amazon FBA Prep",
    description:
      "We prepare your products to meet Amazon’s strict guidelines, so you can hit the ground running.",
    icon: <Box className="w-8 h-8 text-primary" />,
  },
  {
    title: "Local Moving",
    description:
      "Reliable local delivery and pickup to keep your operations smooth and hassle-free.",
    icon: <Move className="w-8 h-8 text-primary" />,
  },
];

const WhatWeOffer = () => {
  return (
    <section className="bg-white py-24 px-6 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-6">What We Offer</h2>
          <p className="text-lg text-third leading-relaxed">
            At Ecom Logistics, we simplify your logistics so you can focus on growing your business.
            With tailored solutions and years of experience, we offer the services that keep your e-commerce
            operations running efficiently and securely.
          </p>
        </div>

        {/* Cards de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map(({ title, description, icon }, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gray-200 p-2 rounded-full">{icon}</div>
                <h3 className="text-xl font-semibold text-blue">{title}</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Nota final */}
        <p className="text-center text-gray-700 text-lg max-w-4xl mx-auto mt-8">
          Our strategic location in California, combined with our experienced team, ensures your logistics are always in good hands.
        </p>
      </div>
    </section>
  );
};

export default WhatWeOffer;
