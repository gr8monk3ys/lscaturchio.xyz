"use client";

import { useState, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { products } from "@/constants/products";
import { ProjectCategory } from "@/types/products";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectTimeline } from "./ProjectTimeline";
import { ProjectViewToggle, ProjectViewWrapper } from "./ProjectViewToggle";
import { ProjectSortMode, ProjectSortToggle } from "./ProjectSortToggle";

type ViewMode = "gallery" | "grid" | "timeline";

interface ProjectsPageContentProps {
  initialCategory: ProjectCategory | "all";
  initialTech: string;
  initialSort: ProjectSortMode;
}

export function ProjectsPageContent({
  initialCategory,
  initialTech,
  initialSort,
}: ProjectsPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const category = initialCategory;
  const tech = initialTech;
  const sort = initialSort;

  const pushFilters = useCallback(
    (nextCategory: ProjectCategory | "all", nextTech: string, nextSort: ProjectSortMode) => {
      const params = new URLSearchParams();

      if (nextCategory !== "all") params.set("category", nextCategory);
      if (nextTech) params.set("tech", nextTech);
      if (nextSort !== "featured") params.set("sort", nextSort);

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const handleCategoryChange = useCallback(
    (nextCategory: ProjectCategory | "all") => {
      pushFilters(nextCategory, tech, sort);
    },
    [pushFilters, sort, tech]
  );

  const handleTechChange = useCallback(
    (nextTech: string) => {
      pushFilters(category, nextTech, sort);
    },
    [category, pushFilters, sort]
  );

  const handleSortChange = useCallback(
    (nextSort: ProjectSortMode) => {
      pushFilters(category, tech, nextSort);
    },
    [category, pushFilters, tech]
  );

  const handleClearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const filteredProjects = useMemo(() => {
    const dateValue = (startDate?: string): number => {
      if (!startDate) return 0;
      const value = new Date(`${startDate}-01`).getTime();
      return Number.isFinite(value) ? value : 0;
    };

    const result = products.filter((project) => {
      const categoryMatch =
        category === "all" || project.categories?.includes(category as ProjectCategory);
      const techMatch = !tech || project.stack?.includes(tech);
      return categoryMatch && techMatch;
    });

    result.sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "oldest") return dateValue(a.startDate) - dateValue(b.startDate);
      if (sort === "newest") return dateValue(b.startDate) - dateValue(a.startDate);

      const aFeatured = a.featured ? 1 : 0;
      const bFeatured = b.featured ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      return dateValue(b.startDate) - dateValue(a.startDate);
    });

    return result;
  }, [category, tech, sort]);

  const hasFilters = category !== "all" || !!tech;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <ProjectFilters
          className="flex-1"
          projects={products}
          currentCategory={category}
          currentTech={tech}
          onCategoryChange={handleCategoryChange}
          onTechChange={handleTechChange}
          onClearFilters={handleClearFilters}
        />
        <div className="flex flex-wrap items-center gap-3">
          <ProjectSortToggle value={sort} onChange={handleSortChange} />
          <ProjectViewToggle mode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>

      {hasFilters && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredProjects.length} of {products.length} projects
        </div>
      )}

      <ProjectViewWrapper
        mode={viewMode}
        galleryView={<ProjectGallery projects={filteredProjects} />}
        gridView={<ProjectGrid projects={filteredProjects} />}
        timelineView={<ProjectTimeline projects={filteredProjects} />}
      />
    </div>
  );
}
