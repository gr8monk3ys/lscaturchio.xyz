"use client";

import { motion } from '@/lib/motion';
import { ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProjectSortMode = "featured" | "newest" | "oldest" | "name";

const options: Array<{ value: ProjectSortMode; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "A–Z" },
];

export function ProjectSortToggle({
  className,
  value,
  onChange,
}: {
  className?: string;
  value: ProjectSortMode;
  onChange: (next: ProjectSortMode) => void;
}) {

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-muted/50 p-1",
        className
      )}
      aria-label="Sort projects"
    >
      <span className="hidden md:inline-flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <ArrowDownUp className="h-3.5 w-3.5" />
        Sort
      </span>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
            className={cn(
              "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.div
                layoutId="activeProjectSort"
                className="absolute inset-0 rounded-md bg-primary"
                transition={{ type: "spring" as const, bounce: 0.2, duration: 0.45 }}
              />
            )}
            <span className="relative">
              <span className="hidden sm:inline">{opt.label}</span>
              <span className="sm:hidden">{opt.value === "featured" ? "Top" : opt.value === "newest" ? "New" : opt.value === "oldest" ? "Old" : "A–Z"}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
