"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const NavbarControls = dynamic(
  () => import("./navbar-controls").then((module) => module.NavbarControls),
  {
    ssr: false,
    loading: () => null,
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

function NavbarControlsSkeleton() {
  return (
    <div className="flex w-[150px] items-center justify-end gap-2">
      <div
        aria-hidden
        className="h-10 w-[88px] rounded-xl border border-border/50 bg-muted/40"
      />
      <div
        aria-hidden
        className="h-10 w-10 rounded-xl border border-border/50 bg-muted/40"
      />
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
