"use client";

import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function NewsletterCTA({
  defaultTopics,
  sourcePath,
}: {
  defaultTopics?: string[];
  sourcePath?: string;
}) {
  return (
    <section className="my-16 border-t border-border pt-8">
      <span className="label-mono block">Newsletter</span>
      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        Enjoyed this?
      </h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Get notified when I publish — new essays on AI, systems, and the world
        they land in. No spam, just the writing.
      </p>
      <div className="mt-6">
        <NewsletterForm defaultTopics={defaultTopics} sourcePath={sourcePath} />
      </div>
    </section>
  );
}
