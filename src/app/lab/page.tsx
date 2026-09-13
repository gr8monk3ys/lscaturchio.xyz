import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { SemanticSearchDemo } from "@/components/lab/semantic-search-demo";
import { ToySimilarity } from "@/components/lab/toy-similarity";
import { EXPERIMENTS } from "@/constants/experiments";
import { LinkArrow } from "@/components/ui/link-arrow";
import { PageHead } from "@/components/ui/page-head";

export const metadata = buildPageMetadata({
  title: "Lab",
  description:
    "Interactive demos of the search and RAG running on this site, plus the side projects too small or too strange for a case study.",
  path: "/lab",
});

export default function LabPage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header — gallery masthead */}
        <PageHead
          className="mb-12"
          kicker="Garden · Experiments"
          title="Lab"
          blurb={
            <>
              Demos of the search and retrieval actually running on this site, and below them the
              side projects that never grew into case studies. Expect rough edges.
            </>
          }
        />

        <section aria-labelledby="demos-heading" className="mb-20">
          <h2 id="demos-heading" className="text-section-title mb-6">
            Running here
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <SemanticSearchDemo />
            <ToySimilarity />
          </div>
        </section>

        <section aria-labelledby="experiments-heading">
          <div className="mb-8">
            <h2 id="experiments-heading" className="text-section-title">
              Elsewhere
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Quantum sensors, numerology, a Fediverse server, and a deck of cards for when the
              work stalls. None of these are a portfolio piece. All of them run.
            </p>
          </div>

          {/* Hairline rows, and an `h3` per row.
              This was `grid gap-px border border-border bg-border
              sm:grid-cols-2` — byte-for-byte the tiled grid that `/garden`
              carried until it was converted, which makes this the sibling that
              conversion should have caught. DESIGN.md assigns index pages
              stacked hairline rows and rules out equal-halves two-column
              compositions; the same page's own "Running here" section above is
              already a single column.

              The titles were `<span className="text-card-title">`: the card
              title step without the heading, so this section's rows were
              invisible to a heading rotor exactly as `/garden`'s eight
              destinations were. `h3`, because the "Elsewhere" `h2` is directly
              above them. */}
          <ul className="max-w-2xl divide-y divide-border border-y border-border">
            {EXPERIMENTS.map((experiment) => (
              <li key={experiment.href}>
                <a
                  href={experiment.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col py-4 transition-colors"
                >
                  <span className="label-mono">{experiment.tag}</span>
                  <h3 className="mt-2 flex items-start gap-1.5 text-card-title text-foreground transition-colors group-hover:text-primary">
                    {experiment.title}
                    <LinkArrow href={experiment.href} className="mt-1 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </h3>
                  <span className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
                    {experiment.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
