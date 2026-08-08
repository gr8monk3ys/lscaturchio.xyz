import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { SemanticSearchDemo } from "@/components/lab/semantic-search-demo";
import { ToySimilarity } from "@/components/lab/toy-similarity";
import { AskLorenzoDemo } from "@/components/lab/ask-lorenzo-demo";
import { EXPERIMENTS } from "@/constants/experiments";
import { ArrowUpRight } from "lucide-react";

export const metadata = buildPageMetadata({
  title: "Lab",
  description:
    "Interactive demos of the search and RAG running on this site, plus the side projects too small or too strange for a case study.",
  path: "/lab",
});

export default function LabPage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-5xl mx-auto">
        {/* Header — gallery masthead */}
        <header className="mb-12">
          <span className="label-mono block">Garden · Experiments</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">Lab</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Demos of the search and retrieval actually running on this site, and below them the
            side projects that never grew into case studies. Expect rough edges.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

        <section aria-labelledby="demos-heading" className="mb-20">
          <h2 id="demos-heading" className="label-mono mb-6">
            Running here
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <SemanticSearchDemo />
            <AskLorenzoDemo />
            <ToySimilarity />
          </div>
        </section>

        <section aria-labelledby="experiments-heading">
          <div className="mb-8">
            <h2 id="experiments-heading" className="label-mono">
              Elsewhere
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Quantum sensors, numerology, a Fediverse server, and a deck of cards for when the
              work stalls. None of these are a portfolio piece. All of them run.
            </p>
          </div>

          <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
            {EXPERIMENTS.map((experiment) => (
              <li key={experiment.href} className="bg-background">
                <a
                  href={experiment.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col p-6 transition-colors hover:bg-muted/40"
                >
                  <span className="label-mono">{experiment.tag}</span>
                  <span className="mt-3 flex items-start gap-1.5 font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {experiment.title}
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
