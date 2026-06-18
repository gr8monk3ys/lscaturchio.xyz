"use client";

import { m, useReducedMotion } from '@/lib/motion';
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
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "inline-flex items-center border-b border-border",
        className
      )}
      aria-label="Sort projects"
    >
      <span className="label-mono hidden items-center gap-2 px-2 text-muted-foreground md:inline-flex">
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
              "label-mono relative flex items-center gap-2 px-3 py-2.5 transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <m.div
                layoutId="activeProjectSort"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                transition={reduce ? { duration: 0 } : { type: 'spring' as const, bounce: 0.2, duration: 0.45 }}
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
