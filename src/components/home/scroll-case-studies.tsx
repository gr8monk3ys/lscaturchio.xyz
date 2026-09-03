import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import {
  LedgerHead,
  LedgerRows,
  LedgerSection,
  ordinal,
} from "@/components/ui/ledger-section";

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
    id: "merge-gate",
    kicker: "Policy Engine",
    title: "merge-gate: Automated Review",
    blurb:
      "Decides which of ~100 open pull requests may merge without a human. Shape is computed from the diff, never eyeballed.",
    metrics: ["49 tests", "~70 repos governed", "Never arms auto-merge"],
    href: "/projects/merge-gate",
    logoSrc: "/images/projects/covers/merge-gate.webp",
  },
  {
    id: "verso",
    kicker: "Product Thinking",
    title: "Verso: A Diary for Artworks",
    blurb:
      "Letterboxd where the unit is the work, not the visit — a frequency bet, stated up front so it can be falsified.",
    metrics: ["10k works seeded", "Offline-first capture", "Thesis measured, not assumed"],
    href: "/projects/verso",
    logoSrc: "/images/projects/covers/verso.webp",
  },
  {
    id: "cocoon",
    kicker: "Shipped Tool",
    title: "Cocoon: Calmer Browsing",
    blurb:
      "A privacy-first extension that lowers sensory load online. Local only, zero network calls, scoped to seven domains.",
    metrics: ["Zero network calls", "4 profiles", "Live at cocoon.lscaturchio.xyz"],
    href: "/projects/cocoon",
    logoSrc: "/images/projects/covers/cocoon.webp",
  },
];

export function ScrollCaseStudies() {
  return (
    <LedgerSection
      head={
        /* Catalogue index — no card, just a labelled list on the paper. */
        <>
          <LedgerHead
            index="02"
            eyebrow="Things I made"
            title="Things I actually shipped."
            description="A policy engine that decides what merges without me, a product built on a stated bet, and a tool people install. All three are running; none of them are demos."
          />

          <LedgerRows items={CASE_STUDIES} numbered className="mt-8 border-t border-border">
            {(item, entryNumber) => (
              <li key={item.id}>
                <a
                  href={`#case-study-${item.id}`}
                  className="group flex items-baseline gap-4 border-b border-border py-4 transition-colors hover:text-primary"
                >
                  <span className="label-mono shrink-0 text-foreground/70">
                    {entryNumber}
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
            )}
          </LedgerRows>
        </>
      }
    >
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
                  {ordinal(index)} — {item.kicker}
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

              <div className="relative aspect-16/10 w-full max-w-[340px] overflow-hidden border border-border bg-muted/30">
                <Image
                  src={item.logoSrc}
                  alt={`${item.title} preview`}
                  fill
                  className="object-cover"
                  sizes="340px"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </LedgerSection>
  );
}
