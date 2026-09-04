"use client";

import { useState, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProjectCategory } from "@/types/products";
import {
  listProjects,
  summarizeCatalogue,
  type ProjectSortMode,
} from "@/lib/project-catalogue";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectTimeline } from "./ProjectTimeline";
import { ProjectViewToggle, ProjectViewWrapper } from "./ProjectViewToggle";
import { ProjectSortToggle } from "./ProjectSortToggle";

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

  const filteredProjects = useMemo(
    () => listProjects({ category, tech, sort }),
    [category, tech, sort]
  );

  const catalogueTotal = summarizeCatalogue().total;

  const hasFilters = category !== "all" || !!tech;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <ProjectFilters
          className="flex-1"
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
          Showing {filteredProjects.length} of {catalogueTotal} projects
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
