"use client";

import { Sparkles } from "lucide-react";
import { motion } from '@/lib/motion';
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function InlineNewsletterCTA({
  defaultTopics,
  sourcePath,
}: {
  defaultTopics?: string[];
  sourcePath?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="mb-8 rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <div className="neu-flat-sm rounded-xl p-2">
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="text-sm font-semibold text-foreground">
          Want more like this?
        </div>
        <div className="text-xs text-muted-foreground">
          Pick topics and get new posts by email.
        </div>
      </div>
      <div className="mt-4">
        <NewsletterForm defaultTopics={defaultTopics} sourcePath={sourcePath} compact />
      </div>
    </motion.div>
  );
}

