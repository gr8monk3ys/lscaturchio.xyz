"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";

const NavbarControls = dynamic(
  () => import("./navbar-controls").then((module) => module.NavbarControls),
  {
    ssr: false,
    loading: () => <NavbarControlsSkeleton />,
  }
);

function scheduleIdleWork(callback: () => void, timeout = 1200) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const idleCallbackId = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(idleCallbackId);
  }

  const timeoutId = globalThis.setTimeout(callback, 1);
  return () => globalThis.clearTimeout(timeoutId);
}

/**
 * Holds the exact geometry of the real controls until the palette bundle
 * arrives. The boxes below mirror CommandPaletteTrigger and ThemeToggle
 * class for class: a narrower placeholder resized the header's right slot on
 * every page load and nudged the nav pill with it.
 */
function NavbarControlsSkeleton() {
  return (
    <div className="flex items-center justify-end gap-2" aria-hidden>
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <span className="hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[0.72rem] font-medium sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </span>
      </div>
      <div className="h-10 w-10 rounded-xl neu-flat" />
    </div>
  );
}

export function NavbarControlsGate() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    return scheduleIdleWork(() => {
      setShouldLoad(true);
    });
  }, []);

  if (!shouldLoad) {
    return <NavbarControlsSkeleton />;
  }

  return <NavbarControls />;
}
