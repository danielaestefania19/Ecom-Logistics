import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Tooltip } from '@heroui/react';
import topIcon from '../../../assets/top.png';
import supportIcon from '../../../assets/support.png';
import competitiveIcon from '../../../assets/competitive.png';
import IconEcom from '../../../assets/Icon-ecologistic.png'
import social from '../../../assets/social.png';

const Icon = ({ available, label }) => (
    <Tooltip content={label} placement="top">
        {available ? (
            <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400 mx-auto" />
        ) : (
            <XCircleIcon className="w-6 h-6 text-red-500 dark:text-red-400 mx-auto" />
        )}
    </Tooltip>
);

const featuresData = [
    ["Delivery Time", "3 – 7 days", "1 – 2 weeks", "2 – 3 weeks"],
    ["Liftgate", true, false, true],
    ["Residential Pickup", true, false, false],
    ["Commercial Pickup", true, true, true],
    ["Hazmat Handling", true, false, false],
    ["POD at Amazon FC", true, false, false],
    ["Daily Pickup", true, false, false],
    ["Personalized Support", true, true, true],
    ["Exclusive Monthly Offers and Discounts", true, false, false],
];

const introItems = [
    {
        icon: topIcon,
        title: 'Top-Rated Service',
        description: 'We are trusted by top Amazon sellers for reliability and efficiency.',
    },
    {
        icon: supportIcon,
        title: '24/7 Customer Support',
        description: 'Always here to assist you with personalized attention.',
    },
    {
        icon: competitiveIcon,
        title: 'Competitive Pricing',
        description: 'Premium logistics at prices that work for your business.',
    },
];

const WhyChooseUs = () => (
    <section className="py-20 px-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
                Why Choose Ecom Logistics?
            </h2>

            {/* Top Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 text-center">
                {introItems.map(({ icon, title, description }, idx) => (
                    <div key={idx} className="flex flex-col items-center px-4">
                        <img src={icon} alt={title} className="w-16 h-16 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                    </div>
                ))}
            </div>

            {/* Feature Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
                    <thead>
                        <tr className="bg-primary text-white text-base">
                            <th className="px-6 py-4 text-left font-semibold">Features</th>
                            <th className="px-6 py-4 text-center font-semibold">
                                <div className="flex items-center justify-center gap-2">
                                    <span>Ecom Logistics</span>
                                    <img src={IconEcom} alt="Ecom Logistics" className="w-5 h-5" />
                                </div>
                            </th>  <th className="px-6 py-4 text-center font-semibold">
                                <div className="flex items-center justify-center gap-2">
                                    <span>Amazon LTL</span>
                                    <img src={social} alt="Amazon LTL" className="w-7 h-7" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center font-semibold">Others (AAA Cooper)</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-gray-200 text-sm">
                        {featuresData.map(([feature, ecom, amazon, others], index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}>
                                <td className="px-6 py-4 font-medium">{feature}</td>
                                <td className="px-6 py-4 text-center">
                                    {typeof ecom === "string" ? ecom : <Icon available={ecom} label={feature} />}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {typeof amazon === "string" ? amazon : <Icon available={amazon} label={feature} />}
                                </td>
                                <td className="px-6 py-4 text-center">
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
