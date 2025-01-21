"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export function FaqSection({ title, description, items, contactInfo }: FaqSectionProps) {
  return (
    <div className="mx-auto max-w-5xl py-16 sm:py-24">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-border">
          <h2 className="text-2xl font-bold leading-10 tracking-tight">{title}</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {description}
          </p>
          <dl className="mt-10 space-y-6 divide-y divide-border">
            <Accordion type="single" collapsible className="w-full">
              {items.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </dl>
          <div className="mt-16 flex flex-col items-center gap-6 rounded-2xl bg-muted p-8">
            <h3 className="text-lg font-semibold leading-7">
              {contactInfo.title}
            </h3>
            <p className="text-center text-sm leading-7 text-muted-foreground">
              {contactInfo.description}
            </p>
            <Button asChild>
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
