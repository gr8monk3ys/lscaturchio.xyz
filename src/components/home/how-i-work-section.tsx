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
    id: "state-the-bet",
    title: "Write the bet down before the code",
    description:
      "Verso exists because logging a gallery visit gives you ~15 events a year and logging each artwork gives you 150+. That claim went in the PRD first, so it could be proven wrong rather than quietly assumed.",
    outcomes: ["Thesis stated up front", "Falsifiable, not decorative", "A number attached to the claim"],
  },
  {
    id: "prove-itself",
    title: "Give every change a way to prove itself",
    description:
      "A change that has not been run is a guess. Boot the server, render the page, run the script on real input — the failure mode of confident output is that nobody executed it.",
    outcomes: ["Run it, don't read it", "Real input, not a mock", "Evidence before assertions"],
  },
  {
    id: "compute-the-call",
    title: "Compute the decision, never eyeball it",
    description:
      "merge-gate classifies a pull request from the shape of its diff. When judgement was done by eye it armed a 197-file change to land unreviewed. Automation earns trust by being narrower than a human, not broader.",
    outcomes: ["Allowlisted shapes only", "No standing permissions", "Policy in three constants"],
  },
  {
    id: "fail-loudly",
    title: "Fail loudly, not silently",
    description:
      "Cocoon warns when a site's layout changes and its rules stop matching. For an accessibility tool a silent no-op is the worst possible outcome — the user assumes it is working and it is not.",
    outcomes: ["Broken states are visible", "Degrade per-site, not globally", "No quiet no-ops"],
  },
  {
    id: "bound-the-damage",
    title: "Bound the blast radius",
    description:
      "Cocoon scopes host permissions to exactly seven domains instead of <all_urls>. FraudStream masks the card number before anything is written. Decide what the system may touch before deciding what it does.",
    outcomes: ["Least privilege by default", "Mask before you store", "Scoped, reversible changes"],
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
            description="Not a methodology. Five things I actually do, each one because skipping it cost me something."
          />

          <span className="label-mono block">Principles</span>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>A change that has not been run is a guess.</li>
            <li>State the bet so it can be proven wrong.</li>
            <li>Narrow beats clever when it runs unattended.</li>
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
                <span className="label-mono text-2xl leading-none tracking-normal text-foreground/60">
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
