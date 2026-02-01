"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/constants/products";
import { ProjectCategory } from "@/types/products";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectTimeline } from "./ProjectTimeline";
import { ProjectViewToggle, ProjectViewWrapper } from "./ProjectViewToggle";

type ViewMode = "grid" | "timeline";

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Get filter values from URL
  const category = (searchParams?.get("category") as ProjectCategory | "all") || "all";
  const tech = searchParams?.get("tech") || "";

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

    return result;
  }, [category, tech]);

  // Calculate filter counts for display
  const hasFilters = category !== "all" || !!tech;

  return (
    <div className="space-y-8">
      {/* Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <ProjectFilters className="flex-1" projects={products} />
        <ProjectViewToggle mode={viewMode} onModeChange={setViewMode} />
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
