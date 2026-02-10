"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-is-desktop";

// Dynamically import the 3D component to avoid SSR issues
const InteractiveProjectCard = dynamic(
  () =>
    import("@/components/three/interactive-project-card").then(
      (mod) => mod.InteractiveProjectCard
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
    ),
  }
);

interface Project {
  title: string;
  description: string;
  href: string;
  stack: string[];
  color?: string;
}

interface InteractiveShowcaseProps {
  projects: Project[];
  className?: string;
}

const projectColors = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f59e0b", // Amber
  "#10b981", // Emerald
];

export function InteractiveShowcase({
  projects,
  className = "",
}: InteractiveShowcaseProps) {
  const isDesktop = useIsDesktop();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [shouldRender3D, setShouldRender3D] = useState(false);

  useEffect(() => {
    // Check device capabilities
    const isLowEnd =
      typeof navigator !== "undefined" && navigator.hardwareConcurrency < 4;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setShouldRender3D(!isLowEnd && !motionQuery.matches);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, projects.length]);

  const currentProject = projects[currentIndex];
  const projectWithColor = {
    ...currentProject,
    color: projectColors[currentIndex % projectColors.length],
  };

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Showcase */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900">
        {shouldRender3D && isDesktop ? (
          <Suspense
            fallback={
              <div className="h-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
            }
          >
            <InteractiveProjectCard
              project={projectWithColor}
              className="h-full"
            />
          </Suspense>
        ) : (
          <FallbackCard project={projectWithColor} />
        )}

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Previous project"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Next project"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Project Info Overlay */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
        >
          <h3 className="text-2xl font-bold text-white mb-2">
            {currentProject.title}
          </h3>
          <p className="text-white/80 mb-4 line-clamp-2">
            {currentProject.description}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              {currentProject.stack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white"
                >
                  {tech}
                </span>
              ))}
            </div>
            <Link
              href={currentProject.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="text-sm font-medium">View</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-primary"
                : "bg-gray-300 dark:bg-gray-600 hover:bg-primary/50"
            }`}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="flex justify-center mt-2">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isAutoPlaying ? "Auto-playing" : "Paused"} - Click to{" "}
          {isAutoPlaying ? "pause" : "resume"}
        </button>
      </div>
    </div>
  );
}

// Fallback for devices that can't render 3D
function FallbackCard({ project }: { project: Project & { color: string } }) {
  return (
    <div
      className="h-full p-8 flex flex-col justify-end"
      style={{
        background: `linear-gradient(135deg, ${project.color}40 0%, ${project.color}10 100%)`,
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Decorative shapes */}
        <div
          className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-30"
          style={{ background: project.color }}
        />
        <div
          className="absolute bottom-20 left-20 w-24 h-24 rounded-lg rotate-45 opacity-20"
          style={{ background: project.color }}
        />
      </div>
    </div>
  );
}
