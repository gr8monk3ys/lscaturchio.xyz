import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Target } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeader } from "@/components/ui/Section";
import { products } from "@/constants/products";

const categoryLabels = {
  "ai-ml": "AI/ML",
  "web-apps": "Web Apps",
  tools: "Tools",
  "open-source": "Open Source",
  "data-science": "Data Science",
} as const;

const featuredResults = products
  .filter((product) => product.featured && product.caseStudy)
  .slice(0, 3)
  .map((product) => ({
    slug: product.slug,
    title: product.title,
    description: product.description,
    categories: product.categories ?? [],
    challenge: product.caseStudy!.challenge,
    results: product.caseStudy!.results.slice(0, 2),
    metrics: product.caseStudy!.metrics?.slice(0, 3) ?? [],
    thumbnail: product.thumbnail,
  }));

export function FeaturedResults() {
  if (featuredResults.length === 0) {
    return null;
  }

  return (
    <Section padding="default" size="wide" divider topDivider reveal={false}>
      <SectionHeader
        title="Selected Results"
        description="A few builds with clear constraints, measurable outcomes, and enough detail to inspect the tradeoffs."
        action={
          <Link
            href="/projects"
            className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all case studies
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {featuredResults.map((project, index) => (
          <Reveal key={project.slug} delayMs={index * 80}>
            <article className="group relative h-full overflow-hidden rounded-3xl border border-border/60 bg-background/90 p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div
                className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full blur-3xl"
                style={{ background: "hsl(var(--primary) / 0.12)" }}
                aria-hidden
              />

              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {project.categories.slice(0, 2).map((category) => (
                    <Badge key={category} variant="secondary">
                      {categoryLabels[category]}
                    </Badge>
                  ))}
                </div>
                <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-background/80 p-2">
                  <Image
                    src={project.thumbnail}
                    alt={`${project.title} logo`}
                    fill
                    className="object-contain p-2"
                    sizes="56px"
                  />
                </div>
              </div>

              <h3 className="mt-5 text-2xl font-display font-semibold tracking-tight">{project.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.description}</p>

              {project.metrics.length > 0 && (
                <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {project.metrics.map((metric) => (
                    <div
                      key={`${project.slug}-${metric.label}-${metric.value}`}
                      className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3"
                    >
                      <div className="text-lg font-semibold tracking-tight tabular-nums">{metric.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-border/60 bg-card/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Target className="size-4 text-primary" />
                  Why it mattered
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.challenge}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  What changed
                </div>
                <ul className="mt-3 space-y-2">
                  {project.results.map((result) => (
                    <li key={result} className="flex items-start gap-2 text-sm text-foreground/85">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/projects/${project.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                Read the case study
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
