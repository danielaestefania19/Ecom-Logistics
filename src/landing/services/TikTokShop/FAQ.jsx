import { Accordion, AccordionItem } from "@heroui/react";
import { Button } from "@heroui/react";

const faqData = [
  {
    question: 'Is there a minimum monthly shipment volume required to partner with Ecom Logistics?',
    answer:
      'No, we offer flexible plans to support businesses of all sizes without requiring a fixed monthly volume.',
  },
  {
    question: 'Who maintains ownership of the goods while stored and handled by Ecom Logistics?',
    answer:
      'You retain full ownership of your inventory at all times—we simply store and manage it on your behalf.',
  },
  {
    question: 'How does Ecom Logistics determine pricing for 3PL services?',
    answer:
      'Pricing is based on volume, storage needs, and service complexity. We tailor quotes to fit your business.',
  },
  {
    question: 'How does Ecom Logistics manage the order fulfillment process?',
    answer:
      'We receive, pick, pack, and ship your orders with real-time tracking and inventory visibility.',
  },
  {
    question: 'Does Ecom Logistics offer reverse logistics or returns management?',
    answer:
      'Yes, we handle product returns efficiently and can reintegrate items into your inventory when possible.',
  },
];

export default function FAQ() {
  return (
    <div className="min-h-[600px] py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-32">

      {/* Columna izquierda */}
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

      {/* Columna derecha */}
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
