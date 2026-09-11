"use client";

import { m } from '@/lib/motion';
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeDownloadButtonProps {
  className?: string;
  /**
   * `primary` paints the one filled CTA a view is allowed. It exists because
   * /professional had none: a comment there asserted this button was the
   * page's primary and demoted the Calendly link to match, but this component
   * only ever rendered `border border-border bg-card` — a secondary. The
   * hiring page shipped with no primary action, and the DOM invariant did not
   * catch it because it asserted *at most* one and never *at least* one.
   */
  variant?: "default" | "outline-solid" | "primary";
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
    <m.a
      href="/api/resume"
      download="Lorenzo_Scaturchio_Resume.pdf"
      onClick={handleDownload}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all",
        variant === "default" && [
          "border border-border bg-card text-foreground",
          "hover:border-primary/45 hover:bg-primary/6 hover:text-primary",
        ],
        variant === "outline-solid" && [
          "neu-button text-foreground hover:text-primary",
        ],
        variant === "primary" && "cta-primary",
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
    </m.a>
  );
}
