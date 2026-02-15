"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Brain, ChevronDown, Code, Server } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Section, SectionHeader } from "@/components/ui/Section";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

type ProofLink = {
  label: string;
  href: string;
};

type CaseStudy = {
  challenge: string;
  solution: string;
  results: string[];
};

type WorkItem = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  result: string;
  linkText: string;
  linkHref: string;
  proofLinks: ProofLink[];
  featured: boolean;
  logo: {
    type: "image";
    src: string;
    alt: string;
  };
  caseStudy: CaseStudy;
};

const workItems: WorkItem[] = [
  {
    id: "talker",
    icon: Brain,
    title: "Talker: RAG Teaching Assistant",
    description:
      "Built a retrieval assistant for course materials with grounded, source-aware responses.",
    result: "Result: Faster, clearer answers for learners.",
    linkText: "View the project",
    linkHref: "/projects/talker",
    proofLinks: [
      { label: "Case study", href: "/projects/talker" },
      { label: "GitHub", href: "https://github.com/gr8monk3ys/TAlker" },
      { label: "Write-up", href: "/blog/building-rag-systems" },
    ],
    featured: true,
    logo: {
      type: "image",
      src: "/images/logos/talker.webp",
      alt: "Talker project logo",
    },
    caseStudy: {
      challenge:
        "Students needed timely answers to course-specific questions outside office hours, but support bottlenecked and engagement dropped.",
      solution:
        "Built a RAG assistant grounded on syllabus + slides that returns citations and can link into multimodal sources like YouTube with timestamps.",
      results: [
        "30% lift in student engagement",
        "25% improvement in learning efficiency",
        "Citations-first answers with multimodal context",
      ],
    },
  },
  {
    id: "trading-bot",
    icon: Code,
    title: "AI-Powered Trading Bot",
    description:
      "Automated trading with sentiment analysis, technical indicators, and strict risk controls.",
    result: "Result: 24/7 monitoring with disciplined trade execution.",
    linkText: "View the project",
    linkHref: "/projects/ai-powered-trading-bot",
    proofLinks: [
      { label: "Case study", href: "/projects/ai-powered-trading-bot" },
      { label: "GitHub", href: "https://github.com/gr8monk3ys/trading-bot" },
    ],
    featured: false,
    logo: {
      type: "image",
      src: "/images/logos/trading-bot.webp",
      alt: "AI-Powered Trading Bot logo",
    },
    caseStudy: {
      challenge:
        "Manual trading requires constant monitoring and is vulnerable to emotional decisions. Risk management is hard to apply consistently.",
      solution:
        "Engineered a bot that combines FinBERT sentiment analysis with technical indicators (SMA/RSI) and strict portfolio/position limits.",
      results: [
        "Automated 24/7 monitoring and execution",
        "Sentiment signals from real-time news",
        "Paper trading support for safe strategy testing",
      ],
    },
  },
  {
    id: "blog-ai",
    icon: Server,
    title: "Blog-AI: Content System",
    description:
      "Automated SEO-aware content generation with GPT-4 workflows and structured output.",
    result: "Result: Consistent drafts with clean MDX + DOCX exports.",
    linkText: "View the project",
    linkHref: "/projects/blog-ai",
    proofLinks: [
      { label: "Case study", href: "/projects/blog-ai" },
      { label: "GitHub", href: "https://github.com/gr8monk3ys/blog-AI" },
    ],
    featured: false,
    logo: {
      type: "image",
      src: "/images/logos/blog-ai.webp",
      alt: "Blog-AI logo",
    },
    caseStudy: {
      challenge:
        "High-quality, SEO-friendly writing takes time. The hard part is structure, consistency, and keeping voice intact across drafts.",
      solution:
        "Built a content pipeline that outputs clean MDX for publishing and DOCX for long-form formats with structured prompts and repeatable workflows.",
      results: [
        "SEO-aware structure from the start",
        "Clean MDX output for publishing",
        "DOCX export for books/long-form",
      ],
    },
  },
];

export function WorkingOnSection() {
  const [openId, setOpenId] = useState<string | null>(workItems[0]?.id ?? null);

  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <SectionHeader
        title="Selected Case Studies"
        description="A few highlights that show how I work"
        align="center"
      />

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
      >
        {workItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openId === item.id;

          return (
            <motion.div key={item.id} variants={staggerItem} layout>
              <motion.div
                layout
                className={cn(
                  "neu-card p-6 h-full relative overflow-hidden group",
                  item.featured
                    ? "border border-primary/20 bg-gradient-to-b from-primary/6 to-background"
                    : "hover:border-primary/20"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="neu-flat-sm rounded-2xl p-3">
                      <Icon className="size-7 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold leading-tight">
                          {item.title}
                        </h3>
                        {item.featured && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase tracking-wide"
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "rounded-xl p-2 neu-pressed",
                        item.featured && "ring-1 ring-primary/30 bg-primary/10"
                      )}
                      aria-hidden
                    >
                      <OptimizedImage
                        src={item.logo.src}
                        alt={item.logo.alt}
                        width={36}
                        height={36}
                        className="rounded-lg"
                        loading="lazy"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setOpenId((prev) => (prev === item.id ? null : item.id))
                      }
                      aria-expanded={isOpen}
                      className="gap-1"
                    >
                      Details
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="text-sm text-foreground/80">{item.result}</div>
                  <span className="hidden sm:block h-4 w-px bg-border/80" aria-hidden />
                  <Link
                    href={item.linkHref}
                    className="text-sm font-semibold text-primary hover:underline inline-flex items-center"
                  >
                    {item.linkText}
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {item.proofLinks.map((proof) => {
                    const isExternal = proof.href.startsWith("http");
                    return (
                      <Button
                        key={proof.href}
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-full px-3"
                      >
                        <Link
                          href={proof.href}
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                        >
                          {proof.label}
                        </Link>
                      </Button>
                    );
                  })}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="mt-5 overflow-hidden"
                    >
                      <div className="pt-5 border-t border-border/60">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Challenge
                            </div>
                            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                              {item.caseStudy.challenge}
                            </p>
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Solution
                            </div>
                            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                              {item.caseStudy.solution}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Outcomes
                          </div>
                          <ul className="mt-3 grid gap-2 sm:grid-cols-3 text-sm text-foreground/80">
                            {item.caseStudy.results.map((result) => (
                              <li
                                key={result}
                                className="rounded-xl border border-border/60 bg-background/70 px-3 py-2"
                              >
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}

