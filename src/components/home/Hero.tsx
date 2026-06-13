import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTED_QUESTIONS = [
  "What do you actually do?",
  "How would you build a RAG system?",
  "Why do you write about politics?",
];

export function Hero() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 py-16 md:grid-cols-[1fr_minmax(0,300px)] md:items-end md:py-24 lg:py-28">
        {/* The name is the work; everything else is the wall label. */}
        <div className="min-w-0 space-y-6">
          <span className="label-mono block">Applied ML · RAG Systems · Essays</span>

          <h2 className="text-balance text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Hey, I&apos;m <span className="text-primary">Lorenzo Scaturchio</span>
          </h2>

          <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
            I build AI systems by day and write about the world they&apos;re being
            built into. Real systems, not demos — and essays with opinions.
          </p>
        </div>

        {/* Framed portrait plate with a mono caption, like a gallery placard. */}
        <figure className="mx-auto w-44 sm:w-52 md:mx-0 md:w-full md:max-w-[300px]">
          <div className="relative aspect-square overflow-hidden border border-border">
            <Image
              src="/images/portrait.webp"
              alt="Lorenzo Scaturchio"
              fill
              priority
              sizes="(max-width: 768px) 208px, 300px"
              className="object-cover"
            />
          </div>
          <figcaption className="label-mono mt-3">Lorenzo Scaturchio · Los Angeles</figcaption>
        </figure>
      </div>

      {/* Ask band — sits below the masthead with its own air. Plain GET form
          so this stays a zero-JS server component; /chat reads ?q=. */}
      <div className="mx-auto max-w-6xl border-t border-border py-10">
        <div className="flex flex-col gap-4">
          <span className="label-mono">Ask the site anything</span>
          <form action="/chat" method="get" className="relative max-w-2xl">
            <label htmlFor="hero-ask" className="sr-only">
              Ask my site anything
            </label>
            <input
              id="hero-ask"
              name="q"
              type="text"
              required
              placeholder="It's read everything I've written…"
              autoComplete="off"
              className="h-14 w-full rounded-none border-0 border-b border-border bg-transparent pr-28 text-lg text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-0"
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
                className="label-mono normal-case tracking-normal text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {question}
              </Link>
            ))}
            <Link
              href="/projects"
              prefetch={false}
              className="label-mono ml-auto text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              View work →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
