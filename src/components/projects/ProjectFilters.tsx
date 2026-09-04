"use client";

import { ProjectCategory } from "@/types/products";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useMemo } from "react";
import {
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
  countProjectsByCategory,
} from "@/lib/project-catalogue";

interface ProjectFiltersProps {
  className?: string;
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
  ...PROJECT_CATEGORIES.map((value) => ({
    value,
    label: PROJECT_CATEGORY_LABELS[value],
  })),
];

export function ProjectFilters({
  className,
  currentCategory,
  currentTech,
  onCategoryChange,
  onTechChange,
  onClearFilters,
}: ProjectFiltersProps) {

  const hasFilters = currentCategory !== "all" || currentTech;

  const categoryCounts = useMemo(() => countProjectsByCategory(), []);

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
              <span className={isActive ? "text-primary" : "text-muted-foreground"}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tech Filter & Clear Button */}
      {/* Static: this row also mounts on arrival when filters come from the
          URL, and an entrance animation can strand it at opacity 0. */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      )}
    </div>
  );
}
