import {
    InboxIcon,
    LockClosedIcon,
    TruckIcon
  } from '@heroicons/react/24/solid';
  
  const steps = [
    {
      icon: <InboxIcon className="w-7 h-7 text-white" />,
      title: "Receive & Inspect Merchandise",
      description:
        "We receive your goods and carefully inspect them to ensure they meet all quality standards and are in perfect condition before storage.",
    },
    {
      icon: <LockClosedIcon className="w-7 h-7 text-white" />,
      title: "Store Your Goods Safely",
      description:
        "Your products are stored securely in optimal conditions, with 24/7 monitoring to ensure their integrity until they are ready to ship.",
    },
    {
      icon: <TruckIcon className="w-7 h-7 text-white" />,
      title: "Pick, Pack & Ship Your Products",
      description:
        "We pick, pack, and ship your products quickly and accurately, ensuring they reach your customers efficiently and without errors.",
    },
  ];
  
  const Request = () => (
    <section className="bg-white py-20 px-6 font-montserrat">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Logistics Process</h2>
        </div>
  
        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-xl transition duration-300 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-third shadow-md">
                {step.icon}
              </div>
              <h4 className="text-lg font-semibold text-primary mb-2">{step.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
  
  export default Request;
  