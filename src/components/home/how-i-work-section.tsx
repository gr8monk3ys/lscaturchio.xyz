import Link from "next/link";
import {
  ArrowRight,
  Compass,
  FlaskConical,
  Gauge,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import { Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";

type Step = {
  id: string;
  title: string;
  description: string;
  outcomes: string[];
  icon: typeof Compass;
};

const STEPS: Step[] = [
  {
    id: "align",
    title: "Align on the problem",
    description:
      "Define what success means, constraints, and the risk surface before writing code.",
    outcomes: ["Clear scope + owner", "Success metrics", "Failure modes + guardrails"],
    icon: Compass,
  },
  {
    id: "prototype",
    title: "Prototype the smallest thing",
    description:
      "Ship a thin slice fast to validate the approach, data, UX, and feasibility.",
    outcomes: ["Working demo", "Baseline evaluation", "Fast iteration loop"],
    icon: FlaskConical,
  },
  {
    id: "reliability",
    title: "Engineer for reliability",
    description:
      "Turn the prototype into a system with tests, observability, and repeatable deployments.",
    outcomes: ["Clean interfaces", "CI + tests", "Logging + tracing"],
    icon: ShieldCheck,
  },
  {
    id: "measure",
    title: "Measure and tune",
    description:
      "Instrument the system and improve quality where it matters: latency, accuracy, and cost.",
    outcomes: ["Eval harness", "Perf budgets", "Cost controls"],
    icon: Gauge,
  },
  {
    id: "launch",
    title: "Launch, monitor, iterate",
    description:
      "Get it in front of users and keep it healthy. Real value comes after launch.",
    outcomes: ["Release plan", "Monitoring + alerts", "Post-launch roadmap"],
    icon: Rocket,
  },
];

export function HowIWorkSection() {
  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(280px,380px)_1fr]">
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
            <ol className="mt-4 space-y-2 text-sm">
              {STEPS.map((step, index) => (
                <li key={step.id}>
                  <a
                    href={`#how-i-work-${step.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-muted-foreground transition-colors hover:bg-primary/[0.04] hover:text-foreground"
                  >
                    <span className="inline-flex size-5 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold tabular-nums">
                      {index + 1}
                    </span>
                    <span>{step.title}</span>
                  </a>
                </li>
              ))}
            </ol>

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
            return (
              <li
                key={step.id}
                id={`how-i-work-${step.id}`}
                className="scroll-mt-28 rounded-2xl border border-border/60 bg-background/85 p-6 shadow-sm transition-colors hover:bg-primary/[0.03]"
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
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
