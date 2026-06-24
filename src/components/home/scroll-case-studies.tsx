import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/ui/Section";

type CaseStudyItem = {
  id: string;
  kicker: string;
  title: string;
  blurb: string;
  metrics: string[];
  href: string;
  logoSrc: string;
};

const CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "talker",
    kicker: "Education RAG",
    title: "Talker: Teaching Assistant",
    blurb:
      "A retrieval assistant grounded on course materials that answers with citations and multimodal context.",
    metrics: ["+30% engagement", "+25% learning", "Citations-first answers"],
    href: "/projects/talker",
    logoSrc: "/images/logos/talker.webp",
  },
  {
    id: "trading-bot",
    kicker: "Automation",
    title: "AI-Powered Trading Bot",
    blurb:
      "Sentiment + technical indicators with strict risk controls, built for disciplined execution and monitoring.",
    metrics: ["24/7 monitoring", "FinBERT signals", "Hard risk limits"],
    href: "/projects/ai-powered-trading-bot",
    logoSrc: "/images/logos/trading-bot.webp",
  },
  {
    id: "blog-ai",
    kicker: "Content Systems",
    title: "Blog-AI: Publishing Pipeline",
    blurb:
      "SEO-aware content generation with structured prompts, clean MDX output, and repeatable workflows.",
    metrics: ["Clean MDX + DOCX", "Repeatable prompts", "Automated drafts"],
    href: "/projects/blog-ai",
    logoSrc: "/images/logos/blog-ai.webp",
  },
];

function formatIndex(i: number): string {
  return String(i + 1).padStart(2, "0");
}

export function ScrollCaseStudies() {
  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(280px,360px)_1fr]">
        {/* Catalogue index — no card, just a labelled list on the paper. */}
        <div className="lg:sticky lg:top-28">
          <span className="label-mono mb-3 block">01 — Case Studies</span>
          <h2 className="text-section-title">Builds that prove the process.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Three projects that show how I build: thin slices, grounded retrieval, and
            systems that stay stable under real users.
          </p>

          <ol className="mt-8 border-t border-border">
            {CASE_STUDIES.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#case-study-${item.id}`}
                  className="group flex items-baseline gap-4 border-b border-border py-4 transition-colors hover:text-primary"
                >
                  <span className="label-mono shrink-0 text-foreground/50">
                    {formatIndex(index)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="label-mono block">{item.kicker}</span>
                    <span className="block truncate text-base font-semibold text-foreground group-hover:text-primary">
                      {item.title}
                    </span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Plates — hairline-framed, hung on the wall with space between. */}
        <div className="space-y-20 md:space-y-28">
          {CASE_STUDIES.map((item, index) => (
            <article
              key={item.id}
              id={`case-study-${item.id}`}
              className="scroll-mt-28"
              aria-label={item.title}
            >
              <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,280px)] md:items-start">
                <div>
                  <span className="label-mono">
                    {formatIndex(index)} — {item.kicker}
                  </span>
                  <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {item.blurb}
                  </p>

                  <p className="label-mono mt-6 text-foreground/70">
                    {item.metrics.join("  ·  ")}
                  </p>

                  <Link
                    href={item.href}
                    className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Read the case study
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="relative aspect-square w-full max-w-[280px] overflow-hidden border border-border bg-muted/30">
                  <Image
                    src={item.logoSrc}
                    alt={`${item.title} logo`}
                    fill
                    className="object-cover p-8"
                    sizes="280px"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
