import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

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
  const [activeIndex, setActiveIndex] = useState(0); 

  const toggle = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start px-2 py-16 max-w-7xl mx-auto gap-32">
      {/* Left side */}
      <div className="lg:w-1/3">
        <h2 className="text-3xl font-bold text-slate-900">Frequently asked questions</h2>
        <p className="text-slate-500 mt-4">
          Amet minim mollit non deserunt ullamco est sit aliqua dolor.
        </p>
        <button className="mt-6 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full">
          Get Started
        </button>
      </div>

      {/* Right side */}
      <div className="lg:w-2/4 space-y-4">
        {faqData.map((faq, index) => (
          <div key={index} className="border rounded-md shadow-sm">
            <button
              onClick={() => toggle(index)}
              className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
            >
              <span className="text-slate-900 font-medium">{faq.question}</span>
              {activeIndex === index ? (
                <Minus className="w-5 h-5 text-slate-900" />
              ) : (
                <Plus className="w-5 h-5 text-slate-900" />
              )}
            </button>
            {activeIndex === index && (
              <div className="px-4 pb-4 text-slate-500">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
