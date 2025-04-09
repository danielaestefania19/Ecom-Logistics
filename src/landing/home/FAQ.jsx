import { Accordion, AccordionItem } from "@heroui/react";

const faqData = [
  {
    question: 'What is Redhunt',
    answer:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor Velit sit officia est do amet sint Velit officia consequat duis enim non deserunt deserunt ullamco.',
  },
  {
    question: 'How I Track my recent parcel?',
    answer: 'You can track your parcel through your Redhunt dashboard or email confirmation.',
  },
  {
    question: 'Redhunt how much takes time to delivery?',
    answer: 'Delivery usually takes between 3 to 5 business days depending on your location.',
  },
  {
    question: 'Redhunt how much takes time to delivery?',
    answer: 'Delivery usually takes between 3 to 5 business days depending on your location.',
  },
];

export default function FAQ() {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start px-2 py-16 max-w-7xl mx-auto gap-32">
      <div className="lg:w-1/3">
        <h2 className="text-3xl font-bold text-slate-900">Frequently asked questions</h2>
        <p className="text-slate-500 mt-4">
          Amet minim mollit non deserunt ullamco est sit aliqua dolor.
        </p>
        <Button
            radius="full"
            className="px-6 py-6 text-lg md:text-xl text-white bg-blue hover:bg-white-100 font-semibold mt-8"
          >
           Get Started
        </Button>
      </div>
      <div className="lg:w-2/4 space-y-4">
        <Accordion variant="splitted" defaultExpandedKeys={["0"]}>
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index.toString()}
              aria-label={`FAQ ${index + 1}`}
              title={faq.question}
            >
              <p className="text-slate-500">{faq.answer}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
