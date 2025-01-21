"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";

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
                <AccordionItem key={index} value={`item-${index}`}>
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 flex flex-col items-center gap-6 rounded-2xl bg-muted p-8"
          >
            <h3 className="text-lg font-semibold leading-7">
              {contactInfo.title}
            </h3>
            <p className="text-center text-sm leading-7 text-muted-foreground">
              {contactInfo.description}
            </p>
            <Button asChild>
              <a 
                href={contactInfo.contactUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                {contactInfo.buttonText}
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
