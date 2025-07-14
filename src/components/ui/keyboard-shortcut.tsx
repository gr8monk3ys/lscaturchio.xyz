// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface KeyboardShortcutProps {
  keys: string[];
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function KeyboardShortcut({
  keys,
  description,
  className,
  size = "md",
}: KeyboardShortcutProps): JSX.Element {
  const sizeClasses = {
    sm: "text-xs py-0.5 px-1.5 min-w-[16px]",
    md: "text-sm py-1 px-2 min-w-[20px]",
    lg: "text-base py-1.5 px-2.5 min-w-[24px]",
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex flex-wrap items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd
              className={cn(
                "inline-flex items-center justify-center rounded border border-stone-200 bg-stone-50 font-mono font-medium text-stone-800 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200",
                sizeClasses[size]
              )}
            >
              {key}
            </kbd>
            {index < keys.length - 1 && key !== "+" && key !== "," && (
              <span className="text-stone-500 dark:text-stone-400">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
      {description && (
        <span className="ml-2 text-sm text-stone-500 dark:text-stone-400">
          {description}
        </span>
      )}
    </div>
  );
}

export function KeyboardShortcutsHelp(): JSX.Element {
  return (
    <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
      <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">
        Keyboard Shortcuts
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <KeyboardShortcut keys={["Ctrl", "K"]} />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Search
          </span>
        </div>
        <div className="flex justify-between">
          <KeyboardShortcut keys={["/"]} />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Focus search
          </span>
        </div>
        <div className="flex justify-between">
          <KeyboardShortcut keys={["Esc"]} />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Close dialog
          </span>
        </div>
        <div className="flex justify-between">
          <KeyboardShortcut keys={["Tab"]} />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Next item
          </span>
        </div>
        <div className="flex justify-between">
          <KeyboardShortcut keys={["Shift", "Tab"]} />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Previous item
          </span>
        </div>
        <div className="flex justify-between">
          <KeyboardShortcut keys={["Home"]} />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Go to top
          </span>
        </div>
        <div className="flex justify-between">
          <KeyboardShortcut keys={["End"]} />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Go to bottom
          </span>
        </div>
      </div>
    </div>
  );
}
