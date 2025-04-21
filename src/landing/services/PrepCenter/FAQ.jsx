import { Accordion, AccordionItem } from "@heroui/react";
import { Button } from "@heroui/react";

const faqData = [
    {
        question: 'How long does it take Ecom Logistics to prepare my products for Amazon FBA?',
        answer: 'Most orders are prepped within 24–72 hours, depending on volume and requirements.',
    },
    {
        question: 'Can Ecom Logistics receive shipments directly from my suppliers?',
        answer: 'Yes, we receive, inspect, and process shipments directly from your vendors.',
    },
    {
        question: 'Does Ecom Logistics have experience handling Hazmat or oversized items?',
        answer: 'Yes, we’re trained and equipped to manage Hazmat and large-size product categories.',
    },
    {
        question: 'Are my products securely stored at Ecom Logistics facilities?',
        answer: 'Absolutely. Our warehouses are monitored 24/7 and follow strict safety protocols.',
    },
    {
        question: 'What payment methods are accepted by Ecom Logistics?',
        answer: 'We accept credit/debit cards, ACH transfers, and wire payments.',
    },
];

export default function FAQ() {
    return (
        <div className="min-h-[600px] py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-32">
            <div className="lg:w-2/4 w-full justify-center self-center text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-medium mb-2 text-blue">
                    Frequently asked questions
                </h2>
                <p className="text-slate-500 mt-4">
                    Everything you need to know about how we manage, store, and ship your goods.
                </p>
                <a href="#contact">
                    <Button
                        radius="full"
                        className="px-6 py-6 text-lg md:text-xl text-white bg-blue hover:bg-white-100 font-semibold mt-8 mx-auto lg:mx-0"
                    >
                        Get Started
                    </Button>
                </a>
            </div>
            <div className="lg:w-2/4 w-full self-center space-y-4">
                <Accordion variant="splitted" defaultExpandedKeys={["0"]}>
                    {faqData.map((faq, index) => (
                        <AccordionItem
                            key={index.toString()}
                            aria-label={`FAQ ${index + 1}`}
                            title={faq.question}
                            className="py-4 px-8"
                        >
                            <p className="text-slate-500">{faq.answer}</p>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
