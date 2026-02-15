"use client";

import { useEffect, useRef } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? true;
}

export function HomeAtmosphere() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const y = window.scrollY || 0;
      // Precompute pixels; keep CSS simple and fast.
      root.style.setProperty("--home-parallax-a", `${Math.round(y * -0.06)}px`);
      root.style.setProperty("--home-parallax-b", `${Math.round(y * -0.03)}px`);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="home-atmosphere pointer-events-none absolute inset-0 -z-10"
    >
      <div className="home-atmosphere__layer home-atmosphere__layer--a" />
      <div className="home-atmosphere__layer home-atmosphere__layer--b" />
      <div className="home-atmosphere__vignette" />
    </div>
  );
}

