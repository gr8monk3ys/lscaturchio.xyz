"use client";

import { ArrowLeft } from "lucide-react";

/**
 * The only interactive handler the essay shell owns. It lives here so
 * `BlogLayout` can stay a Server Component and server-render its end matter.
 */
export function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      aria-label="Go back to blogs"
      className="mb-8 flex h-10 w-10 items-center justify-center border border-border bg-transparent text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
