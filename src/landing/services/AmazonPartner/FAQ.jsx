import { Accordion, AccordionItem } from "@heroui/react";
import { Button } from "@heroui/react";

const faqData = [
  {
    question: 'What are the benefits of choosing Ecom Logistics for shipping to Amazon fulfillment centers?',
    answer: 'We specialize in Amazon FBA compliance, fast delivery windows, and smooth coordination with FCs.',
  },
  {
    question: 'How fast can Ecom Logistics deliver my products to an Amazon Fulfillment Center?',
    answer: 'Depending on location, we can deliver within 1–3 business days.',
  },
  {
    question: 'Does Ecom Logistics offer free pickup service?',
    answer: 'Yes, standard pickup is included in most service plans—contact us to confirm based on your area.',
  },
  {
    question: 'Can Ecom Logistics provide liftgate service if a forklift is unavailable at pickup or delivery?',
    answer: 'Absolutely. We offer liftgate-equipped trucks for safe and easy loading/unloading.',
  },
  {
    question: 'How can I track my shipment to Amazon FC with Ecom Logistics?',
    answer: 'Every shipment includes real-time tracking via our client portal.',
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
