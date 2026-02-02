"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { ArrowRight, Compass, User, BookOpen, MessageSquare } from "lucide-react";

export function NewHereAccordion() {
  return (
    <div className="max-w-2xl mx-auto mb-12">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="new-here" className="border rounded-xl px-6 neu-card">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="neu-flat-sm rounded-lg p-2">
                <Compass className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold">New here? Start with these</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <p className="text-muted-foreground mb-6">
              A quick path to get the most out of this site.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/about" className="group">
                <div className="neu-pressed rounded-xl p-4 h-full hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary font-bold">1</span>
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">About Me</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Get to know who I am.
                  </p>
                  <span className="text-primary text-xs group-hover:underline inline-flex items-center gap-1">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>

              <Link href="/blog" className="group">
                <div className="neu-pressed rounded-xl p-4 h-full hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary font-bold">2</span>
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Explore Blog</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    AI, data science, and dev.
                  </p>
                  <span className="text-primary text-xs group-hover:underline inline-flex items-center gap-1">
                    Browse <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>

              <Link href="/chat" className="group">
                <div className="neu-pressed rounded-xl p-4 h-full hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary font-bold">3</span>
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">AI Chat</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Ask me anything.
                  </p>
                  <span className="text-primary text-xs group-hover:underline inline-flex items-center gap-1">
                    Chat <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
