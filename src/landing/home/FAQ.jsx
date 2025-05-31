import { Accordion, AccordionItem } from "@heroui/react";
import { Button } from "@heroui/react";

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
    <div className="min-h-[600px] py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-32">
      <div className="lg:w-2/4 w-full  justify-center self-center text-center lg:text-left">
        <h2 className="text-4xl md:text-5xl font-medium mb-2 text-blue">
          Frequently asked questions
        </h2>
        <p className="text-slate-500 mt-4">
          Amet minim mollit non deserunt ullamco est sit aliqua dolor.
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
