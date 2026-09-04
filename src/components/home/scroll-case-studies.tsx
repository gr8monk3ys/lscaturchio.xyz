import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { listHomeCaseStudies } from "@/lib/project-catalogue";
import {
  LedgerHead,
  LedgerRows,
  LedgerSection,
  ordinal,
} from "@/components/ui/ledger-section";

/**
 * The three projects the home page leads with. Their copy, metrics and cover
 * live on the project records, so this names an order and nothing else.
 */
const FEATURED_SLUGS = ["merge-gate", "verso", "cocoon"] as const;

const CASE_STUDIES = listHomeCaseStudies(FEATURED_SLUGS);

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
              <li key={item.slug}>
                <a
                  href={`#case-study-${item.slug}`}
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
            key={item.slug}
            id={`case-study-${item.slug}`}
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
                  className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4"
                >
                  Read the case study
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="relative aspect-16/10 w-full max-w-[340px] overflow-hidden border border-border bg-muted/30">
                <Image
                  src={item.coverSrc}
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
