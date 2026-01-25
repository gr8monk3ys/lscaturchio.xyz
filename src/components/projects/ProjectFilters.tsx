"use client";

import { ProjectCategory, ProjectStatus } from "@/types/products";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Filter, ChevronDown } from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";

interface ProjectFiltersProps {
  className?: string;
}

type CategoryOption = {
  value: ProjectCategory | "all";
  label: string;
};

type StatusOption = {
  value: ProjectStatus | "all";
  label: string;
};

const categories: CategoryOption[] = [
  { value: "all", label: "All Projects" },
  { value: "ai-ml", label: "AI/ML" },
  { value: "web-apps", label: "Web Apps" },
  { value: "tools", label: "Tools" },
  { value: "open-source", label: "Open Source" },
  { value: "data-science", label: "Data Science" },
];

const statuses: StatusOption[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "maintained", label: "Maintained" },
  { value: "archived", label: "Archived" },
];

export function ProjectFilters({ className }: ProjectFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [statusOpen, setStatusOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCategory = (searchParams?.get("category") as ProjectCategory | "all") || "all";
  const currentStatus = (searchParams?.get("status") as ProjectStatus | "all") || "all";
  const currentTech = searchParams?.get("tech") || "";

  const hasFilters = currentCategory !== "all" || currentStatus !== "all" || currentTech;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        {categories.map((category) => (
          <motion.button
            key={category.value}
            onClick={() => updateFilters("category", category.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              currentCategory === category.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {category.label}
          </motion.button>
        ))}
      </div>

      {/* Additional Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            aria-expanded={statusOpen}
            aria-haspopup="listbox"
            aria-label="Filter by project status"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "bg-muted/50 hover:bg-muted",
              currentStatus !== "all" && "bg-primary/10 text-primary"
            )}
          >
            <Filter className="h-4 w-4" />
            {statuses.find((s) => s.value === currentStatus)?.label || "Status"}
            <ChevronDown className={cn("h-4 w-4 transition-transform", statusOpen && "rotate-180")} />
          </button>
          {statusOpen && (
            <motion.div
              role="listbox"
              aria-label="Status options"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 z-50 min-w-[160px] p-1 rounded-lg border border-border bg-background shadow-lg"
            >
              {statuses.map((status) => (
                <button
                  key={status.value}
                  role="option"
                  aria-selected={currentStatus === status.value}
                  onClick={() => {
                    updateFilters("status", status.value);
                    setStatusOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm rounded-md transition-colors",
                    currentStatus === status.value
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  {status.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={clearFilters}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium",
              "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            )}
          >
            <X className="h-4 w-4" />
            Clear filters
          </motion.button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap items-center gap-2 pt-2"
        >
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {currentCategory !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm">
              {categories.find((c) => c.value === currentCategory)?.label}
              <button
                onClick={() => updateFilters("category", "all")}
                className="hover:text-primary/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {currentStatus !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm">
              {statuses.find((s) => s.value === currentStatus)?.label}
              <button
                onClick={() => updateFilters("status", "all")}
                className="hover:text-primary/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {currentTech && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm">
              {currentTech}
              <button
                onClick={() => updateFilters("tech", "")}
                className="hover:text-primary/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
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
    status: (searchParams?.get("status") as ProjectStatus | "all") || "all",
    tech: searchParams?.get("tech") || "",
  };
}
