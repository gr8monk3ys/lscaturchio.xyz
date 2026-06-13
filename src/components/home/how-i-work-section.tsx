import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";

type Step = {
  id: string;
  title: string;
  description: string;
  outcomes: string[];
};

const STEPS: Step[] = [
  {
    id: "align",
    title: "Align on the problem",
    description:
      "Define what success means, constraints, and the risk surface before writing code.",
    outcomes: ["Clear scope + owner", "Success metrics", "Failure modes + guardrails"],
  },
  {
    id: "prototype",
    title: "Prototype the smallest thing",
    description:
      "Ship a thin slice fast to validate the approach, data, UX, and feasibility.",
    outcomes: ["Working demo", "Baseline evaluation", "Fast iteration loop"],
  },
  {
    id: "reliability",
    title: "Engineer for reliability",
    description:
      "Turn the prototype into a system with tests, observability, and repeatable deployments.",
    outcomes: ["Clean interfaces", "CI + tests", "Logging + tracing"],
  },
  {
    id: "measure",
    title: "Measure and tune",
    description:
      "Instrument the system and improve quality where it matters: latency, accuracy, and cost.",
    outcomes: ["Eval harness", "Perf budgets", "Cost controls"],
  },
  {
    id: "launch",
    title: "Launch, monitor, iterate",
    description:
      "Get it in front of users and keep it healthy. Real value comes after launch.",
    outcomes: ["Release plan", "Monitoring + alerts", "Post-launch roadmap"],
  },
];

function formatIndex(i: number): string {
  return String(i + 1).padStart(2, "0");
}

export function HowIWorkSection() {
  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="lg:sticky lg:top-28">
          <SectionHeader
            index="02"
            eyebrow="Process"
            title="How I Work"
            description="A simple, repeatable process for shipping reliable ML/RAG systems and clean web products."
          />

          <span className="label-mono block">Principles</span>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>Ship thin slices, fast.</li>
            <li>Measure what matters.</li>
            <li>Harden the edges: tests, observability, and guardrails.</li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="sm" variant="primary">
              <Link href="/contact" prefetch={false}>
                Start a project <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Link
              href="/projects"
              prefetch={false}
              className="label-mono self-center text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              See case studies →
            </Link>
          </div>
        </div>

        {/* Process ledger — numbered rows on the paper, divided by hairlines. */}
        <ol className="border-t border-border">
          {STEPS.map((step, index) => (
            <li
              key={step.id}
              id={`how-i-work-${step.id}`}
              className="scroll-mt-28 border-b border-border py-8"
            >
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
                <span className="label-mono text-2xl leading-none tracking-normal text-foreground/40">
                  {formatIndex(index)}
                </span>
                <div>
                  <h3 className="text-card-title">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  <p className="label-mono mt-4 text-foreground/65">
                    {step.outcomes.join("  ·  ")}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
