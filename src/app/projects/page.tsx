import Link from "next/link";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { ProjectsPageContent } from "@/components/projects/ProjectsPageContent";
import { Metadata } from "next";
import { ArrowUpRight, FolderKanban, Layers3, Star } from "lucide-react";
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
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
          <section className="neu-card p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <FolderKanban className="h-3.5 w-3.5" />
              Case Studies + Builds
            </div>
            <Heading className="mt-6 text-4xl font-bold tracking-tight">Projects</Heading>
            <Paragraph className="mt-4 max-w-3xl text-lg text-muted-foreground">
              Selected RAG systems, applied ML tools, and product engineering work. Each project is a
              concrete build with the constraint, approach, and tradeoffs made visible.
            </Paragraph>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/work-with-me"
                className="cta-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Work With Me
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="neu-button inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:text-primary"
              >
                Discuss a Similar Build
              </Link>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="neu-flat rounded-2xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                How to Browse
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Start with featured work if you want the strongest end-to-end examples.</li>
                <li>Use category and stack filters to narrow to the systems closest to your problem.</li>
                <li>Switch views if you want a gallery, dense grid, or time-based timeline.</li>
              </ul>
            </div>
            <div className="neu-card p-6">
              <h2 className="text-lg font-semibold">Looking for custom work?</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                The fastest path is usually a scoped first sprint: define the goal, ship a thin slice,
                then harden only what the product actually needs.
              </p>
            </div>
          </aside>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderKanban className="h-4 w-4 text-primary" />
              Total Projects
            </div>
            <p className="mt-3 text-3xl font-bold">{projectCount}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-primary" />
              Featured Builds
            </div>
            <p className="mt-3 text-3xl font-bold">{featuredCount}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers3 className="h-4 w-4 text-primary" />
              Active Categories
            </div>
            <p className="mt-3 text-3xl font-bold">{categoryCount}</p>
          </div>
        </div>

        <ProjectsPageContent
          initialCategory={initialCategory}
          initialTech={initialTech}
          initialSort={initialSort}
        />
      </div>
    </Container>
  );
}
