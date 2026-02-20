import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { ProjectsPageContent } from "@/components/projects/ProjectsPageContent";
import { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { ogCardUrl } from "@/lib/seo";
import { ProjectCategory } from "@/types/products";
import { ProjectSortMode } from "@/components/projects/ProjectSortToggle";

export const metadata: Metadata = {
  title: "Projects | Lorenzo Scaturchio",
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

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Projects</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            A collection of AI/ML experiments, web applications, and developer tools.
            Click any project to see the full case study with technical details.
          </Paragraph>
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
