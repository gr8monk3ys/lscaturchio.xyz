import Link from "next/link";
import Image from "next/image";
import { LinkArrow } from "@/components/ui/link-arrow";

import { listHomeCaseStudies } from "@/lib/project-catalogue";
import { spellCount } from "@/lib/spell-count";
import { LedgerRows, ordinal } from "@/components/ui/ledger-section";
import { PlateHead } from "@/components/home/plate-head";
import { cn } from "@/lib/utils";

/**
 * The projects the home page leads with. Their copy, metrics and cover
 * live on the project records, so this names an order and nothing else.
 */
const FEATURED_SLUGS = ["cocoon", "verso", "merge-gate", "monkey-smp"] as const;

const CASE_STUDIES = listHomeCaseStudies(FEATURED_SLUGS);

export function ScrollCaseStudies() {
  return (
    <section className="w-full border-b border-rule">
      {/* The placard, and beside it the catalogue index of what follows. */}
      <div className="plate-grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="plate-cell py-10 md:py-14">
          <PlateHead
            index="01"
            eyebrow="Things I made"
            title="Things I actually shipped."
            description={`${spellCount(CASE_STUDIES.length)} things I built, each written up as who it is for and what changes for them. All of them are running; none of them are demos.`}
          />
        </div>

        <LedgerRows items={CASE_STUDIES} numbered className="divide-y divide-rule">
          {(item, entryNumber) => (
            <li key={item.slug}>
              <a
                href={`#case-study-${item.slug}`}
                className="plate-cell group flex items-baseline gap-4 transition-colors hover:text-primary"
              >
                <span className="label-mono shrink-0">{entryNumber}</span>
                <span className="min-w-0 flex-1">
                  <span className="label-mono block">{item.kicker}</span>
                  {/* The ellipsis says text is missing without saying what
                      it was, so the `title` gives it back. */}
                  <span
                    title={item.title}
                    className="block text-base font-semibold text-foreground group-hover:text-primary"
                  >
                    {item.title}
                  </span>
                </span>
                {/* A same-page anchor: horizontal motion only, never the
                    leaves-the-site arrow. `LinkArrow` picks it from the href. */}
                <LinkArrow
                  href={`#case-study-${item.slug}`}
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </a>
            </li>
          )}
        </LedgerRows>
      </div>

      {/* Plates: the cover large, in colour and whole (the files are 16:10),
          with its label as the ruled cell beside it. Sides alternate. */}
      {CASE_STUDIES.map((item, index) => {
        const coverSecond = index % 2 === 1;
        return (
          <article
            key={item.slug}
            id={`case-study-${item.slug}`}
            aria-label={item.title}
            className={cn(
              "plate-grid scroll-mt-20 border-t border-rule",
              coverSecond
                ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
                : "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
            )}
          >
            <div className={cn("relative aspect-16/10 w-full", coverSecond && "lg:order-2")}>
              <Image
                src={item.coverSrc}
                alt={`${item.title} preview`}
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 67vw"
              />
            </div>

            <div className="plate-cell flex flex-col py-8">
              <span className="label-mono">
                {ordinal(index)} — {item.kicker}
              </span>
              <h3 className="mt-4 text-section-title">{item.title}</h3>
              <p className="text-lede mt-4 text-foreground">{item.blurb}</p>

              <ul className="mt-6 border-t border-rule">
                {item.metrics.map((metric) => (
                  <li key={metric} className="label-mono border-b border-rule py-2">
                    {metric}
                  </li>
                ))}
              </ul>

              <Link
                href={item.href}
                className="label-link group mt-auto inline-flex items-center gap-2 self-start pt-8 text-sm font-semibold text-primary underline-offset-4"
              >
                Read the case study
                <LinkArrow
                  href={item.href}
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}
