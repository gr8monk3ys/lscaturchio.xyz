"use client";

import { ProjectCategory, Product } from "@/types/products";
import { m } from '@/lib/motion';
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useMemo } from "react";

interface ProjectFiltersProps {
  className?: string;
  projects: Product[];
  currentCategory: ProjectCategory | "all";
  currentTech: string;
  onCategoryChange: (category: ProjectCategory | "all") => void;
  onTechChange: (tech: string) => void;
  onClearFilters: () => void;
}

type CategoryOption = {
  value: ProjectCategory | "all";
  label: string;
};

const categories: CategoryOption[] = [
  { value: "all", label: "All" },
  { value: "ai-ml", label: "AI/ML" },
  { value: "web-apps", label: "Web Apps" },
  { value: "tools", label: "Tools" },
  { value: "open-source", label: "Open Source" },
  { value: "data-science", label: "Data Science" },
];

export function ProjectFilters({
  className,
  projects,
  currentCategory,
  currentTech,
  onCategoryChange,
  onTechChange,
  onClearFilters,
}: ProjectFiltersProps) {

  const hasFilters = currentCategory !== "all" || currentTech;

  // Calculate project counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    categories.slice(1).forEach((cat) => {
      counts[cat.value] = projects.filter((p) =>
        p.categories?.includes(cat.value as ProjectCategory)
      ).length;
    });
    return counts;
  }, [projects]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const count = categoryCounts[category.value] || 0;
          const isActive = currentCategory === category.value;

          // Don't show categories with 0 projects (except "All")
          if (count === 0 && category.value !== "all") return null;

          return (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                "label-mono flex items-center gap-1.5 border px-3.5 py-2 transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {category.label}
              <span className={isActive ? "text-primary/70" : "text-foreground/40"}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tech Filter & Clear Button */}
      {hasFilters && (
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2"
        >
          {currentTech && (
            <span className="label-mono inline-flex items-center gap-1.5 text-primary">
              Tech: {currentTech}
              <button
                onClick={() => onTechChange("")}
                className="hover:text-primary/70 transition-colors"
                aria-label={`Remove ${currentTech} filter`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={onClearFilters}
            className="label-mono inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        </m.div>
      )}
    </div>
  );
}
