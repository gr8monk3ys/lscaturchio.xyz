"use client";

import { motion } from '@/lib/motion';
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeDownloadButtonProps {
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "small";
}

export function ResumeDownloadButton({
  className,
  variant = "default",
  size = "default",
}: ResumeDownloadButtonProps) {
  const handleDownload = async () => {
    // Track download (optional analytics)
    try {
      await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "track" }),
      });
    } catch {
      // Silently fail - tracking is optional
    }
  };

  return (
    <motion.a
      href="/api/resume"
      download="Lorenzo_Scaturchio_Resume.pdf"
      onClick={handleDownload}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all",
        variant === "default" && [
          "border border-zinc-200 bg-white/50 text-zinc-900 backdrop-blur-sm",
          "hover:border-zinc-300 hover:bg-white/80",
          "dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100",
          "dark:hover:border-zinc-700 dark:hover:bg-zinc-900/80",
        ],
        variant === "outline" && [
          "neu-button text-foreground hover:text-primary",
        ],
        size === "default" && "px-6 py-3 text-base",
        size === "small" && "px-4 py-2 text-sm",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>Download Resume</span>
      <Download
        className={cn(
          "transition-transform group-hover:translate-y-0.5",
          size === "default" && "h-5 w-5",
          size === "small" && "h-4 w-4"
        )}
      />
    </motion.a>
  );
}
