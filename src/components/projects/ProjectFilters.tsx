"use client";

import { ProjectCategory, Product } from "@/types/products";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useCallback, useMemo } from "react";

interface ProjectFiltersProps {
  className?: string;
  projects: Product[];
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

export function ProjectFilters({ className, projects }: ProjectFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategory = (searchParams?.get("category") as ProjectCategory | "all") || "all";
  const currentTech = searchParams?.get("tech") || "";

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

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

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
            <motion.button
              key={category.value}
              onClick={() => updateFilters("category", category.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {category.label}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Active Tech Filter & Clear Button */}
      {hasFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2"
        >
          {currentTech && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Tech: {currentTech}
              <button
                onClick={() => updateFilters("tech", "")}
                className="hover:text-primary/70 transition-colors"
                aria-label={`Remove ${currentTech} filter`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Hook for consuming filter state in other components
export function useProjectFilters() {
  const searchParams = useSearchParams();

  return {
    category: (searchParams?.get("category") as ProjectCategory | "all") || "all",
    tech: searchParams?.get("tech") || "",
  };
}
