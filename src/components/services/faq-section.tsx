"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQStructuredData } from "@/components/ui/structured-data";

interface FaqItem {
  question: string;
  answer: string;
}

interface ContactInfo {
  title: string;
  description: string;
  buttonText: string;
  contactUrl: string;
}

interface FaqSectionProps {
  title: string;
  description: string;
  items: FaqItem[];
  contactInfo: ContactInfo;
}

// No entrance animation here on purpose: the previous framer-motion mount
// animation was missed under `LazyMotion strict`, leaving the whole accordion
// stuck at opacity 0. The content is visible by default.
export function FaqSection({ title, description, items, contactInfo }: FaqSectionProps) {
  return (
    <div className="mx-auto max-w-5xl py-16 sm:py-24">
      <FAQStructuredData questions={items} />
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-border">
          <h2 className="text-section-title">{title}</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {description}
          </p>
          <div className="mt-10 space-y-6 divide-y divide-border">
            <Accordion type="single" collapsible className="w-full">
              {items.map((faq, index) => (
                <AccordionItem key={faq.question} value={`item-${index}`}>
                  <AccordionTrigger className="text-left group">
                    <span className="group-hover:text-primary transition-colors">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-muted-foreground">{faq.answer}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <h3 className="text-card-title">{contactInfo.title}</h3>
            <p className="mt-2 text-muted-foreground">{contactInfo.description}</p>
            <Button asChild variant="primary" className="mt-4 rounded-full">
              <a href={contactInfo.contactUrl} target="_blank" rel="noopener noreferrer">
                {contactInfo.buttonText}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
