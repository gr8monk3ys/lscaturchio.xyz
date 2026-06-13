import Link from "next/link";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { ProjectsPageContent } from "@/components/projects/ProjectsPageContent";
import { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { ogCardUrl } from "@/lib/seo";
import { products } from "@/constants/products";
import { ProjectCategory } from "@/types/products";
import { ProjectSortMode } from "@/components/projects/ProjectSortToggle";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A collection of AI/ML, web development, and open source projects. Full case studies with technical details, challenges, and results.",
  openGraph: {
    title: "Projects | Lorenzo Scaturchio",
    description:
      "A collection of AI/ML, web development, and open source projects with full case studies.",
    images: [
      {
        url: ogCardUrl({
          title: "Projects",
          description: "Case studies and technical write-ups",
          type: "project",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Lorenzo Scaturchio",
    description: "Case studies and technical write-ups.",
    images: [ogCardUrl({ title: "Projects", description: "Case studies and technical write-ups", type: "project" })],
  },
};

type SearchParamValue = string | string[] | undefined;

function getSearchParamValue(
  params: Record<string, SearchParamValue>,
  key: string
): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function normalizeCategory(value: string): ProjectCategory | "all" {
  const allowed = new Set<ProjectCategory>([
    "ai-ml",
    "web-apps",
    "tools",
    "open-source",
    "data-science",
  ]);
  if (allowed.has(value as ProjectCategory)) return value as ProjectCategory;
  return "all";
}

function normalizeSort(value: string): ProjectSortMode {
  const allowed: ProjectSortMode[] = ["featured", "newest", "oldest", "name"];
  return allowed.includes(value as ProjectSortMode) ? (value as ProjectSortMode) : "featured";
}

export default async function Projects({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const initialCategory = normalizeCategory(getSearchParamValue(params, "category"));
  const initialTech = getSearchParamValue(params, "tech");
  const initialSort = normalizeSort(getSearchParamValue(params, "sort"));
  const projectCount = products.length;
  const featuredCount = products.filter((project) => project.featured).length;
  const categoryCount = new Set(
    products.flatMap((project) => project.categories ?? [])
  ).size;

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <span className="label-mono block">Case Studies &amp; Builds</span>
          <Heading className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Projects</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Selected RAG systems, applied ML tools, and product engineering work. Each project is a
            concrete build with the constraint, approach, and tradeoffs made visible.
          </Paragraph>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/work-with-me"
              className="cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Work With Me
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="label-mono text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Discuss a similar build →
            </Link>
          </div>

          {/* Catalogue stats — wall-label numerals divided by hairlines. */}
          <dl className="mt-10 grid grid-cols-3 divide-x divide-border border-y border-border">
            {[
              { label: "Projects", value: projectCount },
              { label: "Featured", value: featuredCount },
              { label: "Categories", value: categoryCount },
            ].map((stat) => (
              <div key={stat.label} className="px-5 py-6 first:pl-0">
                <dd className="font-display text-4xl font-semibold tracking-tight">{stat.value}</dd>
                <dt className="label-mono mt-2">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </header>

        <ProjectsPageContent
          initialCategory={initialCategory}
          initialTech={initialTech}
          initialSort={initialSort}
        />
      </div>
    </Container>
  );
}
