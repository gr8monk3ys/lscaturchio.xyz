"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAskDrawer } from "@/components/chat/ask-drawer-provider";

const SUGGESTED_QUESTIONS = [
  "What do you actually do?",
  "How would you build a RAG system?",
  "Why do you write about politics?",
];

/**
 * The masthead ask field, routed into the drawer.
 *
 * The drawer exists because the essay sidebar's ask panel was a form whose
 * submit navigated the reader away from what they were reading. That was still
 * true of this field, which is the site's front door: it posted to /chat and
 * took the visitor off the home page mid-thought. Fixing the small surface and
 * leaving the signature one was the wrong half.
 *
 * The placeholder is an example question, not a claim about the index. It read
 * "It's read everything I've written…", which tells the reader what the system
 * is rather than what to type — and the wall label above already says "Ask the
 * site anything". A field teaches by example or it teaches nothing.
 *
 * It stays a real GET form. Without JavaScript, or before hydration, it submits
 * to /chat exactly as before; with the drawer mounted, the submit is intercepted
 * and the question is handed over in place. Same for the suggested questions,
 * which remain ordinary links to /chat?q=.
 */
export function HeroAsk() {
  const drawer = useAskDrawer();

  const handOver = (question: string) => {
    if (!drawer || !question.trim()) return false;
    drawer.open(question);
    return true;
  };

  return (
    <div className="mx-auto max-w-6xl border-t border-border py-10">
      <div className="flex flex-col gap-4">
        <span className="label-mono">Ask the site anything</span>

        <form
          action="/chat"
          method="get"
          className="relative max-w-2xl"
          onSubmit={(event) => {
            const field = event.currentTarget.elements.namedItem("q");
            const value = field instanceof HTMLInputElement ? field.value : "";
            if (handOver(value)) {
              event.preventDefault();
              if (field instanceof HTMLInputElement) field.value = "";
            }
          }}
        >
          <label htmlFor="hero-ask" className="sr-only">
            Ask my site anything
          </label>
          <input
            id="hero-ask"
            name="q"
            type="text"
            required
            placeholder="What have you changed your mind about?"
            autoComplete="off"
            /* The site's one documented exception to the global focus outline.
               DESIGN.md:299: "Focus turns the rule Forest Ink with no ring" —
               so `focus:outline-none` is load-bearing here and nowhere else,
               and it is the reason this line is allowlisted in
               design-drift.test.ts rather than cleaned up with the other 53.

               `focus:border-b-2` is new. A 1px hairline changing colour was the
               weakest indicator on the site while the rest of it moved to a 2px
               outline; doubling the rule gives the exception the same 2px
               weight without making it a ring, which is what the spec actually
               forbids. The field is a fixed h-14 box, so the extra pixel comes
               out of the content box and shifts nothing. */
            className="h-14 w-full rounded-none border-0 border-b border-border bg-transparent pr-28 text-lg text-foreground placeholder:text-muted-foreground focus:border-b-2 focus:border-primary focus:outline-none"
          />
          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="absolute right-0 top-1/2 h-10 -translate-y-1/2 rounded-full px-5"
          >
            Ask
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <Link
              key={question}
              href={`/chat?q=${encodeURIComponent(question)}`}
              prefetch={false}
              onClick={(event) => {
                if (handOver(question)) event.preventDefault();
              }}
              className="label-mono label-link normal-case tracking-normal text-muted-foreground ink-underline transition-colors hover:text-primary"
            >
              {question}
            </Link>
          ))}
        </div>

        {/* Not in the chip row, and not in the chip costume.
            This carried the same `label-mono label-link ink-underline` stack as
            the three suggested questions, differing only in text colour — so
            four items looked alike while three filled the ask box and one
            navigated away. A hairline and its own line say which is which. */}
        <div className="mt-2 border-t border-border pt-4">
          <Link
            href="/projects"
            prefetch={false}
            className="label-link inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Or look at the work
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
