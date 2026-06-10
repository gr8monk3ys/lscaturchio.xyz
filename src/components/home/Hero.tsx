import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTED_QUESTIONS = [
  "What do you actually do?",
  "How would you build a RAG system?",
  "Why do you write about politics?",
];

export function Hero() {
  return (
    <section className="relative min-h-[55vh] sm:min-h-[60vh] w-full flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute top-8 right-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-6 left-10 h-48 w-48 rounded-full bg-accent/35 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 shrink-0 rounded-full overflow-hidden">
            <Image
              src="/images/portrait.webp"
              alt="Lorenzo Scaturchio"
              fill
              priority
              sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 208px"
              className="rounded-full object-cover"
            />
          </div>

          <div className="text-center md:text-left space-y-4 max-w-2xl min-w-0 md:flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              Applied ML + RAG Systems
            </div>
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Hey, I&apos;m <span className="text-primary">Lorenzo Scaturchio</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              I build AI systems by day and write about the world they&apos;re being
              built into. Real systems, not demos — and essays with opinions.
            </p>
          </div>
        </div>

        {/* Ask-my-site-anything: a plain GET form so this stays a zero-JS server
            component. /chat reads ?q= and prefills the conversation. */}
        <div className="mx-auto w-full max-w-2xl space-y-3">
          <form action="/chat" method="get" className="group relative">
            <label htmlFor="hero-ask" className="sr-only">
              Ask my site anything
            </label>
            <MessageCircle
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
            />
            <input
              id="hero-ask"
              name="q"
              type="text"
              required
              placeholder="Ask my site anything — it's read everything I've written"
              autoComplete="off"
              className="h-14 w-full rounded-full border border-border bg-background/80 pl-13 pr-32 text-base text-foreground shadow-sm backdrop-blur placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full px-5"
            >
              Ask
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <Link
                key={question}
                href={`/chat?q=${encodeURIComponent(question)}`}
                prefetch={false}
                className="rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {question}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <Button asChild size="lg" variant="outline" className="cta-secondary text-base h-11 px-7">
            <Link href="/projects" prefetch={false}>
              View My Work
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="cta-secondary text-base h-11 px-7">
            <Link href="/work-with-me" prefetch={false}>
              Work With Me
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
