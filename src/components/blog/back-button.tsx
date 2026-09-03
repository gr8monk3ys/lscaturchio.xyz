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
      className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
    >
      <ArrowLeft className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
    </button>
  );
}
