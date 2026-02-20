"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, useScroll } from '@/lib/motion';
import {
  ArrowRight,
  Compass,
  FlaskConical,
  Gauge,
  ShieldCheck,
  Rocket,
} from "lucide-react";

import { Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  description: string;
  outcomes: string[];
  icon: typeof Compass;
};

const STEPS: Step[] = [
  {
    title: "Align on the problem",
    description:
      "Define what success means, constraints, and the risk surface before writing code.",
    outcomes: ["Clear scope + owner", "Success metrics", "Failure modes + guardrails"],
    icon: Compass,
  },
  {
    title: "Prototype the smallest thing",
    description:
      "Ship a thin slice fast to validate the approach, data, UX, and feasibility.",
    outcomes: ["Working demo", "Baseline evaluation", "Fast iteration loop"],
    icon: FlaskConical,
  },
  {
    title: "Engineer for reliability",
    description:
      "Turn the prototype into a system with tests, observability, and repeatable deployments.",
    outcomes: ["Clean interfaces", "CI + tests", "Logging + tracing"],
    icon: ShieldCheck,
  },
  {
    title: "Measure and tune",
    description:
      "Instrument the system and improve quality where it matters: latency, accuracy, and cost.",
    outcomes: ["Eval harness", "Perf budgets", "Cost controls"],
    icon: Gauge,
  },
  {
    title: "Launch, monitor, iterate",
    description:
      "Get it in front of users and keep it healthy. Real value comes after launch.",
    outcomes: ["Release plan", "Monitoring + alerts", "Post-launch roadmap"],
    icon: Rocket,
  },
];

export function HowIWorkSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [progress, setProgress] = useState<{
    activeStep: number;
    revealedSteps: Set<number>;
  }>({
    activeStep: 0,
    revealedSteps: new Set(),
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 35%"],
  });

  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    // If IntersectionObserver isn't available, just show everything.
    if (typeof IntersectionObserver === "undefined") {
      setProgress((prev) => {
        const allRevealed = new Set(nodes.map((_, idx) => idx));
        const hasChanged = prev.revealedSteps.size !== allRevealed.size;
        if (!hasChanged) return prev;
        return { ...prev, revealedSteps: allRevealed };
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const rawIndex = el.dataset.stepIndex;
          const idx = rawIndex ? Number(rawIndex) : NaN;
          if (!Number.isFinite(idx)) return;

          setProgress((prev) => {
            const alreadyRevealed = prev.revealedSteps.has(idx);
            if (alreadyRevealed && prev.activeStep === idx) return prev;

            const nextRevealed = alreadyRevealed ? prev.revealedSteps : new Set(prev.revealedSteps);
            if (!alreadyRevealed) nextRevealed.add(idx);

            return {
              activeStep: idx,
              revealedSteps: nextRevealed,
            };
          });
        });
      },
      {
        root: null,
        // Narrow activation band around the middle of the viewport.
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0.01,
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const jumpToStep = (index: number) => {
    const node = stepRefs.current[index];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeStep = progress.activeStep;
  const revealedSteps = progress.revealedSteps;

  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <div ref={containerRef} className="grid items-start gap-10 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <div className="space-y-6 lg:sticky lg:top-28">
          <SectionHeader
            title="How I Work"
            description="A simple, repeatable process for shipping reliable ML/RAG systems and clean web products."
          />

          <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
            <div className="text-sm font-semibold text-foreground">Principles</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Ship thin slices, fast.</li>
              <li>Measure what matters.</li>
              <li>Harden the edges: tests, observability, and guardrails.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
            <div className="text-sm font-semibold text-foreground">Steps</div>
            <div className="relative mt-4 pl-6">
              <div className="absolute left-2 top-1 bottom-1 w-px bg-border/70" aria-hidden />
              <motion.div
                className="absolute left-2 top-1 bottom-1 w-px origin-top bg-gradient-to-b from-primary via-primary/60 to-transparent"
                style={{ scaleY: scrollYProgress }}
                aria-hidden
              />
              <ul className="space-y-3">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="relative">
                    <button
                      type="button"
                      onClick={() => jumpToStep(index)}
                      className={cn(
                        "group flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors",
                        activeStep === index
                          ? "bg-primary/8 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                      )}
                      aria-current={activeStep === index ? "step" : undefined}
                    >
                      <span
                        className={cn(
                          "mt-1 inline-flex size-4 shrink-0 items-center justify-center rounded-full border",
                          activeStep === index
                            ? "border-primary/40 bg-primary/15"
                            : "border-border bg-background"
                        )}
                        aria-hidden
                      >
                        <span
                          className={cn(
                            "size-2 rounded-full transition-colors",
                            activeStep === index ? "bg-primary" : "bg-muted-foreground/40 group-hover:bg-primary/60"
                          )}
                        />
                      </span>
                      <span className="leading-snug">{step.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="sm" variant="primary">
                <Link href="/contact">
                  Start a project <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="cta-secondary">
                <Link href="/projects">
                  See case studies <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <ol className="space-y-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const revealed = revealedSteps.has(index);
            const isActive = activeStep === index;

            return (
              <div
                key={step.title}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                data-step-index={index}
                data-reveal-state={revealed ? "in" : "out"}
                style={
                  {
                    "--reveal-y": "18px",
                    "--reveal-delay": `${Math.min(index * 70, 220)}ms`,
                  } as CSSProperties
                }
                className={cn(
                  "reveal scroll-mt-28 rounded-2xl border border-border/60 bg-background/85 p-6 shadow-sm transition-colors",
                  isActive ? "ring-1 ring-primary/25 bg-primary/5" : "hover:bg-primary/[0.03]"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="neu-flat-sm rounded-2xl p-3">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-card-title">{step.title}</h3>
                      <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        {index + 1}/{STEPS.length}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                    <ul className="mt-4 grid gap-2 text-sm text-foreground/80 sm:grid-cols-3">
                      {step.outcomes.map((item) => (
                        <li key={item} className="rounded-xl border border-border/60 bg-background/70 px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
