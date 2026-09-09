import Link from "next/link";

import { SectionHeader } from "@/components/ui/Section";
import { LedgerRows, LedgerSection } from "@/components/ui/ledger-section";

type Step = {
  id: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    id: "state-the-bet",
    title: "Write the bet down before the code",
    description:
      "Verso exists because logging a gallery visit gives you ~15 events a year and logging each artwork gives you 150+. That claim went in the PRD first, so it could be proven wrong rather than quietly assumed.",
  },
  {
    id: "prove-itself",
    title: "Give every change a way to prove itself",
    description:
      "A change that has not been run is a guess. Boot the server, render the page, run the script on real input — the failure mode of confident output is that nobody executed it.",
  },
  {
    id: "compute-the-call",
    title: "Compute the decision, never eyeball it",
    description:
      "merge-gate classifies a pull request from the shape of its diff. When judgement was done by eye it armed a 197-file change to land unreviewed. Automation earns trust by being narrower than a human, not broader.",
  },
  {
    id: "fail-loudly",
    title: "Fail loudly, not silently",
    description:
      "Cocoon warns when a site's layout changes and its rules stop matching. For an accessibility tool a silent no-op is the worst possible outcome — the user assumes it is working and it is not.",
  },
  {
    id: "bound-the-damage",
    title: "Bound the blast radius",
    description:
      "Cocoon scopes host permissions to exactly seven domains instead of <all_urls>. FraudStream masks the card number before anything is written. Decide what the system may touch before deciding what it does.",
  },
];

export function HowIWorkSection() {
  return (
    <LedgerSection
      head={
        <>
          {/* No `index`. The "02" here was inherited from the home page's
              01-04 numbering, but this section only ever renders on
              /work-with-me — which opened on 02 and had no 01. */}
          <SectionHeader
            eyebrow="Process"
            title="How I work"
            description="Not a methodology. Five things I actually do, each one because skipping it cost me something."
          />

          <span className="label-mono block">Principles</span>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>A change that has not been run is a guess.</li>
            <li>State the bet so it can be proven wrong.</li>
            <li>Narrow beats clever when it runs unattended.</li>
          </ul>

          {/* Both mono links. This page had three filled primary CTAs — the
              masthead's "Schedule a call", this one, and the FAQ's verbatim
              repeat of the masthead's. DESIGN.md allows one per view, and the
              masthead owns it. */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href="/contact"
              prefetch={false}
              className="label-mono label-link text-foreground ink-underline hover:text-primary"
            >
              Start a project →
            </Link>
            <Link
              href="/projects"
              prefetch={false}
              className="label-mono label-link text-foreground ink-underline hover:text-primary"
            >
              See case studies →
            </Link>
          </div>
        </>
      }
    >
      {/* Process ledger — numbered rows on the paper, divided by hairlines. */}
      <LedgerRows items={STEPS} numbered className="border-t border-border">
        {(step, entryNumber) => (
          <li
            key={step.id}
            id={`how-i-work-${step.id}`}
            className="scroll-mt-28 border-b border-border py-8"
          >
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
              <span className="label-mono text-2xl leading-none tracking-normal text-foreground/60">
                {entryNumber}
              </span>
              <div>
                <h3 className="text-card-title">{step.title}</h3>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          </li>
        )}
      </LedgerRows>
    </LedgerSection>
  );
}
