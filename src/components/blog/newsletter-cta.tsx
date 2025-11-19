"use client";

import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Sparkles } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function NewsletterCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="my-12 p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-background border border-primary/20 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />

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
            <div className="mt-1 p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Deep Dives</h4>
              <p className="text-xs text-muted-foreground">
                Technical tutorials and comprehensive guides
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Latest Trends</h4>
              <p className="text-xs text-muted-foreground">
                Stay ahead with cutting-edge tech insights
              </p>
            </div>
          </div>
        </div>

        <NewsletterForm />
      </div>
    </motion.div>
  );
}
