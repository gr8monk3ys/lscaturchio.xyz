"use client";

import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function InlineNewsletterCTA({
  defaultTopics,
  sourcePath,
}: {
  defaultTopics?: string[];
  sourcePath?: string;
}) {
  return (
    <div className="mb-8 border border-border p-5">
      <span className="label-mono block">Want more like this?</span>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick topics and get new essays by email.
      </p>
      <div className="mt-4">
        <NewsletterForm defaultTopics={defaultTopics} sourcePath={sourcePath} compact />
      </div>
    </div>
  );
}
