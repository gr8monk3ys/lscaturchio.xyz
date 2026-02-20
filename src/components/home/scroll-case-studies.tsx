"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from '@/lib/motion';
import { ArrowUpRight, Brain, Code, Server } from "lucide-react";

import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

type CaseStudyItem = {
  id: string;
  kicker: string;
  title: string;
  blurb: string;
  metrics: string[];
  href: string;
  icon: typeof Brain;
  logoSrc: string;
  accent: {
    fg: string;
    bg: string;
    glow: string;
  };
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
    icon: Brain,
    logoSrc: "/images/logos/talker.webp",
    accent: {
      fg: "text-emerald-800",
      bg: "bg-emerald-500/10",
      glow: "hsl(152 52% 20% / 0.28)",
    },
  },
  {
    id: "trading-bot",
    kicker: "Automation",
    title: "AI-Powered Trading Bot",
    blurb:
      "Sentiment + technical indicators with strict risk controls, built for disciplined execution and monitoring.",
    metrics: ["24/7 monitoring", "FinBERT signals", "Hard risk limits"],
    href: "/projects/ai-powered-trading-bot",
    icon: Code,
    logoSrc: "/images/logos/trading-bot.webp",
    accent: {
      fg: "text-sky-900",
      bg: "bg-sky-500/10",
      glow: "hsl(210 80% 55% / 0.22)",
    },
  },
  {
    id: "blog-ai",
    kicker: "Content Systems",
    title: "Blog-AI: Publishing Pipeline",
    blurb:
      "SEO-aware content generation with structured prompts, clean MDX output, and repeatable workflows.",
    metrics: ["Clean MDX + DOCX", "Repeatable prompts", "Automated drafts"],
    href: "/projects/blog-ai",
    icon: Server,
    logoSrc: "/images/logos/blog-ai.webp",
    accent: {
      fg: "text-amber-900",
      bg: "bg-amber-500/10",
      glow: "hsl(38 92% 50% / 0.20)",
    },
  },
];

function formatIndex(i: number): string {
  return String(i + 1).padStart(2, "0");
}

function CaseStudyPanel({
  item,
  index,
  onActive,
}: {
  item: CaseStudyItem;
  index: number;
  onActive: (index: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const mediaY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-18, 18]
  );
  const mediaScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [1.02, 0.98]
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          onActive(index);
        });
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0.01,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [index, onActive]);

  const Icon = item.icon;

  return (
    <div
      id={`case-study-${item.id}`}
      ref={ref}
      className="relative min-h-[70vh] md:min-h-[86vh] flex items-center"
      aria-label={item.title}
    >
      <div
        className={cn(
          "w-full rounded-3xl border border-border/60 bg-background/85 shadow-sm overflow-hidden",
          "transition-shadow duration-300 hover:shadow-lg"
        )}
      >
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                <span className="tabular-nums">{formatIndex(index)}</span>
                <span className="h-3 w-px bg-border/70" aria-hidden />
                <span>{item.kicker}</span>
              </div>
              <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", item.accent.bg, item.accent.fg)}>
                <Icon className="size-3.5" />
                Proof inside
              </div>
            </div>

            <h3 className="mt-5 text-2xl sm:text-3xl font-display font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {item.blurb}
            </p>

            <ul className="mt-6 grid gap-2 sm:grid-cols-3 text-sm">
              {item.metrics.map((m) => (
                <li
                  key={m}
                  className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-foreground/85"
                >
                  {m}
                </li>
              ))}
            </ul>

            <div className="mt-7">
              <Link
                href={item.href}
                className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                Read the case study
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[240px] md:min-h-[unset] border-t md:border-t-0 md:border-l border-border/60 bg-[linear-gradient(135deg,hsl(var(--background)),hsl(var(--accent)))]">
            <motion.div
              className="absolute inset-0"
              style={{ y: mediaY, scale: mediaScale }}
            >
              <div className="absolute inset-0 opacity-70">
                <div className="absolute -top-10 -right-10 size-52 rounded-full blur-3xl"
                  style={{ background: item.accent.glow }}
                  aria-hidden
                />
                <div className="absolute -bottom-12 -left-12 size-60 rounded-full blur-3xl"
                  style={{ background: "hsl(var(--accent) / 0.55)" }}
                  aria-hidden
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center p-10">
                <div className="relative size-[140px] sm:size-[160px] md:size-[200px] rounded-[28px] border border-white/15 bg-white/10 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
                  <Image
                    src={item.logoSrc}
                    alt={`${item.title} logo`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScrollCaseStudies() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const activeItem = CASE_STUDIES[Math.min(Math.max(active, 0), CASE_STUDIES.length - 1)];

  const background = useMemo(() => {
    return {
      glow: activeItem?.accent.glow ?? "hsl(var(--primary) / 0.2)",
    };
  }, [activeItem]);

  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <div className="grid gap-10 lg:grid-cols-[minmax(300px,420px)_1fr] items-start">
        <div className="space-y-6 lg:sticky lg:top-28">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 p-7 shadow-sm">
            <div
              className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full blur-3xl"
              style={{ background: background.glow, opacity: reduceMotion ? 0.18 : 0.26 }}
              aria-hidden
            />

            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              Scroll Stories
            </div>

            <h2 className="mt-4 text-section-title">
              Case studies, but as a narrative.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Three builds that show how I think: thin slices, grounded retrieval, and systems that stay stable under real users.
            </p>

            {activeItem && (
              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Now reading
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground tabular-nums">
                    {formatIndex(active)} / {formatIndex(CASE_STUDIES.length - 1)}
                  </div>
                </div>
                <div className="mt-2 text-lg font-display font-semibold tracking-tight">
                  {activeItem.title}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {activeItem.blurb}
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-2">
              {CASE_STUDIES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActive(index);
                    const target = document.getElementById(`case-study-${item.id}`);
                    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                    active === index
                      ? "border-primary/30 bg-primary/8"
                      : "border-border/60 bg-background/60 hover:bg-primary/[0.04]"
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-muted-foreground tabular-nums">
                      {formatIndex(index)} <span className="mx-1 opacity-50">/</span> {item.kicker}
                    </div>
                    <div className="truncate text-sm font-semibold text-foreground">
                      {item.title}
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {CASE_STUDIES.map((item, index) => (
            <CaseStudyPanel
              key={item.id}
              item={item}
              index={index}
              onActive={setActive}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
