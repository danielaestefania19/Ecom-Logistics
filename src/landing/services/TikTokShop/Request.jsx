import steps1 from '../../../assets/steps1.jpg';
import steps2 from '../../../assets/steps2.jpg';
import steps3 from '../../../assets/steps3.jpg';

const steps = [
  {
    image: steps1,
    title: "Receive & Inspect Merchandise",
    description:
      "We receive your goods and carefully inspect them to ensure they meet all quality standards and are in perfect condition before storage.",
  },
  {
    image: steps2,
    title: "Store Your Goods Safely",
    description:
      "Your products are stored securely in optimal conditions, with 24/7 monitoring to ensure their integrity until they are ready to ship.",
  },
  {
    image: steps3,
    title: "Pick, Pack & Ship Your Products",
    description:
      "We pick, pack, and ship your products quickly and accurately, ensuring they reach your customers efficiently and without errors.",
  },
];

const Request = () => (
  <section className="bg-white py-20 px-6  bg-no-repeat bg-cover bg-center">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-gray-800">Our Logistics Process</h2>
      </div>
      <div className="flex flex-col gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-start w-full overflow-hidden hover:scale-105"
          >
            {/* Imagen arriba en mobile, a la izquierda en desktop */}
            <div className="w-full md:w-96 h-64 md:h-72 flex-shrink-0">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Contenido */}
            <div className="p-6 md:p-8 flex flex-col justify-center text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-4 md:mb-6 leading-tight tracking-tight">
                {step.title}
              </h2>
              <p className="text-lg font-medium text-black opacity-80">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>


);


export default Request;
