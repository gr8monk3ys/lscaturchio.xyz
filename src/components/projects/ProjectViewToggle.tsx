"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "timeline";

interface ProjectViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function ProjectViewToggle({ mode, onModeChange, className }: ProjectViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-lg bg-muted/50", className)}>
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
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`View as ${label.toLowerCase()}`}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeViewToggle"
          className="absolute inset-0 bg-primary rounded-md"
          transition={{ type: "spring" as const, bounce: 0.2, duration: 0.4 }}
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
  gridView: React.ReactNode;
  timelineView: React.ReactNode;
  className?: string;
}

export function ProjectViewWrapper({
  mode,
  gridView,
  timelineView,
  className,
}: ProjectViewWrapperProps) {
  return (
    <div className={cn("relative min-h-[400px]", className)}>
      <AnimatePresence mode="wait">
        {mode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {gridView}
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {timelineView}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
