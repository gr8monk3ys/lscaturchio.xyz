import Link from "next/link";
import { Container } from "@/components/Container";
import { PageHead } from "@/components/ui/page-head";
import { ProjectsPageContent } from "@/components/projects/ProjectsPageContent";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import {
  readSearchParam,
  type SearchParamValue,
} from "@/lib/search-params";
import { normalizeProjectCategory } from "@/lib/project-catalogue";

export const metadata: Metadata = buildPageMetadata({
  title: "Projects",
  description:
    "RAG systems, applied ML tools and product engineering work, each with the constraint it was built against and what it cost.",
  path: "/projects",
  cardType: "project",
});

export default async function Projects({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const initialCategory = normalizeProjectCategory(
    readSearchParam(params, "category")
  );
  const initialTech = readSearchParam(params, "tech");

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto">
        {/* `PageHead` owns the type scale. This used to hand `Heading` an
            explicit `text-4xl md:text-5xl`, which lives in the same
            tailwind-merge group as `text-page-title` and silently replaced the
            clamp — the bug already fixed inside `PageHead` for the other
            sixteen routes, still open here because this page never used it. */}
        <PageHead
          className="mb-10"
          kicker="Case studies & builds"
          title="Projects"
          blurb="RAG systems, applied ML tools and product engineering work. Each one names the constraint it was built against."
          rule={false}
        >
          {/* One CTA, not two plus a stat row. The three tiles that sat here
              counted "Featured: 3 · Categories: 4" — the catalogue's own
              taxonomy, reported to a visitor who has no use for it. */}
          <Link
            href="/contact"
            className="label-mono mt-6 inline-block text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Discuss a similar build →
          </Link>
        </PageHead>

        <ProjectsPageContent
          initialCategory={initialCategory}
          initialTech={initialTech}
        />
      </div>
    </Container>
  );
}
