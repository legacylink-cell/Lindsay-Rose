import React from "react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "./ui/accordion";
import { FAQS } from "../mock";

const FAQ = () => {
  return (
    <section id="faq" className="section-pad">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold">Good to know</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl font-600 text-brand-ink">
            Questions, answered
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-white rounded-2xl px-6 shadow-soft ring-1 ring-black/5 border-none"
            >
              <AccordionTrigger className="text-left font-600 text-brand-ink hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-brand-ink/65 leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
