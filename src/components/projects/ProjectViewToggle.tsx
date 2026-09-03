"use client";

import { m, useReducedMotion } from '@/lib/motion';
import { LayoutDashboard, LayoutGrid, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "gallery" | "grid" | "timeline";

interface ProjectViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function ProjectViewToggle({ mode, onModeChange, className }: ProjectViewToggleProps) {
  return (
    <div className={cn("flex items-center border-b border-border", className)}>
      <ToggleButton
        isActive={mode === "gallery"}
        onClick={() => onModeChange("gallery")}
        icon={<LayoutDashboard className="h-4 w-4" />}
        label="Gallery"
      />
      <ToggleButton
        isActive={mode === "grid"}
        onClick={() => onModeChange("grid")}
        icon={<LayoutGrid className="h-4 w-4" />}
        label="Grid"
      />
      <ToggleButton
        isActive={mode === "timeline"}
        onClick={() => onModeChange("timeline")}
        icon={<Clock className="h-4 w-4" />}
        label="Timeline"
      />
    </div>
  );
}

interface ToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ToggleButton({ isActive, onClick, icon, label }: ToggleButtonProps) {
  const reduce = useReducedMotion();
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`View as ${label.toLowerCase()}`}
      className={cn(
        "label-mono relative flex items-center gap-2 px-3 py-2.5 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {isActive && (
        <m.div
          layoutId="activeViewToggle"
          className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
          transition={reduce ? { duration: 0 } : { type: 'spring' as const, bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </span>
    </button>
  );
}

// Wrapper component that handles view mode state and renders children
interface ProjectViewWrapperProps {
  mode: ViewMode;
  galleryView: React.ReactNode;
  gridView: React.ReactNode;
  timelineView: React.ReactNode;
  className?: string;
}

export function ProjectViewWrapper({
  mode,
  galleryView,
  gridView,
  timelineView,
  className,
}: ProjectViewWrapperProps) {
  // No crossfade between views. These panels held every project link on the
  // page, and the `initial={{ opacity: 0 }}` mount was missed under
  // `LazyMotion strict`: switching to Grid or Timeline rendered a blank
  // 400px block with 20 live links inside it. Page content never mounts
  // hidden (DESIGN.md: the page is paper and does not move).
  return (
    <div className={cn("relative min-h-[400px]", className)}>
      {mode === "gallery" ? galleryView : mode === "grid" ? gridView : timelineView}
    </div>
  );
}
