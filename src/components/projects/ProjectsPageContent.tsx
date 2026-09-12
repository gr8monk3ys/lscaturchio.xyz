"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProjectCategory } from "@/types/products";
import { listProjects, summarizeCatalogue } from "@/lib/project-catalogue";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectGallery } from "./ProjectGallery";

interface ProjectsPageContentProps {
  initialCategory: ProjectCategory | "all";
  initialTech: string;
}

/**
 * Eighteen projects, one filter row, one view.
 *
 * This used to offer a category row, a four-way sort toggle and a three-way
 * view toggle — twelve or thirteen controls for eighteen items, which is an
 * admin UI on a page whose only job is to get someone to open one project.
 * The view mode was also local `useState` while the filters were URL params,
 * so going back dropped one of the reader's choices and kept the others.
 *
 * Gallery is the view. Category is the filter. Tech arrives from a project
 * page and shows as a removable chip rather than a control.
 */
export function ProjectsPageContent({
  initialCategory,
  initialTech,
}: ProjectsPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();

  const category = initialCategory;
  const tech = initialTech;

  const pushFilters = useCallback(
    (nextCategory: ProjectCategory | "all", nextTech: string) => {
      const params = new URLSearchParams();

      if (nextCategory !== "all") params.set("category", nextCategory);
      if (nextTech) params.set("tech", nextTech);

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const handleCategoryChange = useCallback(
    (nextCategory: ProjectCategory | "all") => pushFilters(nextCategory, tech),
    [pushFilters, tech]
  );

  const handleTechChange = useCallback(
    (nextTech: string) => pushFilters(category, nextTech),
    [category, pushFilters]
  );

  const handleClearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const filteredProjects = useMemo(
    () => listProjects({ category, tech }),
    [category, tech]
  );

  const catalogueTotal = summarizeCatalogue().total;

  return (
    <div className="space-y-8">
      <ProjectFilters
        currentCategory={category}
        currentTech={tech}
        onCategoryChange={handleCategoryChange}
        onTechChange={handleTechChange}
        onClearFilters={handleClearFilters}
      />

      {/* `role="status"`, so a filter change is heard and not only seen.
          The six category buttons got `aria-pressed` in #235 and a group name
          in #237, which told a screen-reader user *which* filter was on — and
          still left the result silent: clicking AI/ML swaps 18 cards for 6
          with no announcement that anything happened. The visible count was
          already here; it just was not a live region. Also unconditional now,
          because "18 of 18" is the answer to "did my click do anything". */}
      <p role="status" className="label-mono text-muted-foreground">
        {filteredProjects.length} of {catalogueTotal}
      </p>

      {filteredProjects.length > 0 ? (
        <ProjectGallery projects={filteredProjects} />
      ) : (
        /* An empty filter result used to render nothing at all. */
        <p className="border-t border-border pt-8 text-muted-foreground">
          Nothing in this category yet.{" "}
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Show everything
          </button>
          .
        </p>
      )}
    </div>
  );
}
