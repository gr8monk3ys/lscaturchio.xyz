"use client";

import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Sparkles } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function NewsletterCTA({
  defaultTopics,
  sourcePath,
}: {
  defaultTopics?: string[];
  sourcePath?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="my-12 p-8 rounded-2xl neu-card relative overflow-hidden"
    >

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-2xl font-bold">Enjoyed this article?</h3>
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed">
          Join my newsletter to get notified when I publish new articles on AI, technology, and philosophy.
          I share in-depth insights, practical tutorials, and thought-provoking ideas.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-xl neu-flat-sm">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Deep Dives</h4>
              <p className="text-xs text-muted-foreground">
                Technical tutorials and detailed guides
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-xl neu-flat-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Latest Trends</h4>
              <p className="text-xs text-muted-foreground">
                The latest in AI and tech
              </p>
            </div>
          </div>
        </div>

        <NewsletterForm defaultTopics={defaultTopics} sourcePath={sourcePath} />
      </div>
    </motion.div>
  );
}
