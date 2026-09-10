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
      <h3 className="mt-2 text-section-title">
        Enjoyed this?
      </h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        An email when I publish something new. That is the whole list; I have never
        sent it for any other reason.
      </p>
      <div className="mt-6">
        <NewsletterForm defaultTopics={defaultTopics} sourcePath={sourcePath} />
      </div>
    </section>
  );
}
