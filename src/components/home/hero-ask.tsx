"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAskDrawer } from "@/components/chat/ask-drawer-provider";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";

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
            /* Three characters shorter than "…changed your mind about?",
               which measured 309px against the 291px this field actually
               offers at 390px. Shrinking the button and the type recovered
               most of the gap; the rest had to come out of the copy, because a
               placeholder that does not fit is not an example, it is a defect. */
            placeholder="What have you changed your mind on?"
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
            /* `pr-12 sm:pr-28` and `text-base sm:text-lg`.
               At 390px the button's 112px reservation left roughly 240px for
               an 18px placeholder, so the site's signature field rendered
               "What have you changed you" — hard-clipped mid-word, with no
               ellipsis, against the overlapping button. The reservation now
               matches what the control actually occupies at each width: the
               submit is 40px there, so 48px of padding clears it with 8px to
               spare. Measured at 390px: 285px of placeholder into 299px of
               room. 16px, not 14px, because a sub-16px input font makes iOS
               zoom the whole page on focus. */
            className="h-14 w-full rounded-none border-0 border-b border-border bg-transparent pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-b-2 focus:border-primary focus:outline-none sm:pr-28 sm:text-lg"
          />
          {/* Icon-only below sm, labelled. The word "Ask" costs ~64px of the
              placeholder's line on a phone, and the wall label directly above
              already says "Ask the site anything" — so the text is redundant
              at exactly the width where it is most expensive. */}
          <Button
            type="submit"
            size="lg"
            variant="primary"
            aria-label="Ask"
            className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full p-0 sm:w-auto sm:px-5"
          >
            <span className="hidden sm:inline">Ask</span>
            <ArrowRight className="h-4 w-4 sm:ml-1.5" />
          </Button>
        </form>

        <SuggestedQuestions questions={SUGGESTED_QUESTIONS} onSelect={handOver} />

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
