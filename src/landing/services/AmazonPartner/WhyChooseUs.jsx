import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Tooltip } from '@heroui/react';

const Icon = ({ available, label }) => (
  <Tooltip content={label} placement="top">
    {available ? (
      <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" />
    ) : (
      <XCircleIcon className="w-6 h-6 text-red-500 mx-auto" />
    )}
  </Tooltip>
);

const WhyChooseUs = () => (
  <section className="py-16 px-4 bg-white">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Tiempos de entrega y Liftgate</h2>
      <div className="overflow-auto">
        <table className="table-auto w-full text-left border-collapse border border-gray-200">
          <thead>
            <tr className="bg-primary text-white">
              <th className="p-3 border">Características</th>
              <th className="p-3 border text-center">E-com Logistics</th>
              <th className="p-3 border text-center">Amazon LTL</th>
              <th className="p-3 border text-center">Otros (AAA Cooper)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Tiempo de entrega", "3 – 7 días", "1 – 2 semanas", "2 – 3 semanas"],
              ["Liftgate", true, false, true],
              ["Residencial", true, false, true],
              ["Comercial", true, true, true],
              ["Hazmat", true, false, false],
              ["POD en Amazon FC", true, false, false],
              ["Every day Pickup", true, false, false],
              ["Asistencia personalizada", true, true, true],
              ["Ofertas y descuentos exclusivos", true, false, false],
            ].map(([feature, ecom, amazon, others], index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-3 border font-medium">{feature}</td>
                <td className="p-3 border text-center">
                  {typeof ecom === "string" ? ecom : <Icon available={ecom} label={feature} />}
                </td>
                <td className="p-3 border text-center">
                  {typeof amazon === "string" ? amazon : <Icon available={amazon} label={feature} />}
                </td>
                <td className="p-3 border text-center">
                  {typeof others === "string" ? others : <Icon available={others} label={feature} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
