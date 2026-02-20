"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from '@/lib/motion';
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

export function FaqSection({ title, description, items, contactInfo }: FaqSectionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-5xl py-16 sm:py-24"
    >
      <FAQStructuredData questions={items} />
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-border">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold leading-10 tracking-tight"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 text-base leading-7 text-muted-foreground"
          >
            {description}
          </motion.p>
          <dl className="mt-10 space-y-6 divide-y divide-border">
            <Accordion type="single" collapsible className="w-full">
              {items.map((faq, index) => (
                <AccordionItem key={faq.question} value={`item-${index}`}>
                  <AccordionTrigger className="text-left group">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="group-hover:text-primary transition-colors"
                    >
                      {faq.question}
                    </motion.span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-muted-foreground"
                    >
                      {faq.answer}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </dl>

          <div className="mt-10 rounded-2xl neu-card p-6">
            <h3 className="text-lg font-semibold">{contactInfo.title}</h3>
            <p className="mt-2 text-muted-foreground">{contactInfo.description}</p>
            <Button asChild variant="primary" className="mt-4">
              <a href={contactInfo.contactUrl} target="_blank" rel="noopener noreferrer">
                {contactInfo.buttonText}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
