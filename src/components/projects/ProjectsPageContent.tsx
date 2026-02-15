"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/constants/products";
import { ProjectCategory } from "@/types/products";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectTimeline } from "./ProjectTimeline";
import { ProjectViewToggle, ProjectViewWrapper } from "./ProjectViewToggle";
import { ProjectSortMode, ProjectSortToggle } from "./ProjectSortToggle";

type ViewMode = "gallery" | "grid" | "timeline";

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");

  // Get filter values from URL
  const category = (searchParams?.get("category") as ProjectCategory | "all") || "all";
  const tech = searchParams?.get("tech") || "";
  const sort = (searchParams?.get("sort") as ProjectSortMode | null) ?? "featured";

  // Filter projects based on current filters
  const filteredProjects = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (category && category !== "all") {
      result = result.filter((p) => p.categories?.includes(category as ProjectCategory));
    }

    // Filter by tech
    if (tech) {
      result = result.filter((p) => p.stack?.includes(tech));
    }

    const dateValue = (startDate?: string): number => {
      if (!startDate) return 0;
      const value = new Date(`${startDate}-01`).getTime();
      return Number.isFinite(value) ? value : 0;
    };

    // Sort (cinematic layout is handled by the view components)
    result.sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "oldest") return dateValue(a.startDate) - dateValue(b.startDate);
      if (sort === "newest") return dateValue(b.startDate) - dateValue(a.startDate);

      // featured (default): featured first, then newest
      const af = a.featured ? 1 : 0;
      const bf = b.featured ? 1 : 0;
      if (bf !== af) return bf - af;
      return dateValue(b.startDate) - dateValue(a.startDate);
    });

    return result;
  }, [category, tech, sort]);

  // Calculate filter counts for display
  const hasFilters = category !== "all" || !!tech;

  return (
    <div className="space-y-8">
      {/* Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <ProjectFilters className="flex-1" projects={products} />
        <div className="flex flex-wrap items-center gap-3">
          <ProjectSortToggle />
          <ProjectViewToggle mode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>

      {/* Results Count */}
      {hasFilters && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredProjects.length} of {products.length} projects
        </div>
      )}

      {/* Project Display */}
      <ProjectViewWrapper
        mode={viewMode}
        galleryView={<ProjectGallery projects={filteredProjects} />}
        gridView={<ProjectGrid projects={filteredProjects} />}
        timelineView={<ProjectTimeline projects={filteredProjects} />}
      />
    </div>
  );
}

// Wrapper with Suspense for useSearchParams
export function ProjectsPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
