"use client";

import { useEffect } from "react";
import Lenis from "lenis";
// The package's own stylesheet, and it is not optional. It carries
// `.lenis [data-lenis-prevent] { overscroll-behavior: contain }` and
// `.lenis.lenis-stopped { overflow: clip }`. Without it the six opt-out regions
// keep the JS wheel handback but lose scroll-chaining containment, so reaching
// the bottom of the chat transcript or the command palette list scrolls the
// document behind it. Shipping the attribute without the rule it depends on is
// worse than not shipping the opt-out: DESIGN.md then states as settled fact
// something that is half true.
import "lenis/dist/lenis.css";

import { prefersReducedMotion, setScroller } from "@/lib/smooth-scroll";

/**
 * Scroll acceleration for the whole document.
 *
 * Deliberately **not** the transform-based kind. Locomotive-style scrollers
 * translate a wrapper element, which breaks `position: sticky` outright — and
 * this site has nine sticky elements carrying real work: the essay contents
 * rail, the ledger rails on /work-with-me and /uses, the project gallery's
 * detail pane, and the work timeline's date column. Lenis in its default mode
 * drives the real scroll position instead, so sticky, `IntersectionObserver`,
 * `useScroll` and the reading-progress bar all keep working on native scroll
 * events. That was the constraint that chose the library.
 *
 * Three things it must respect, each of which is a bug if it does not:
 *
 * 1. `prefers-reduced-motion`. The instance is never created — not created and
 *    stopped, never created — so a reader who asks for no motion gets the
 *    browser's own scrolling with none of this code in the way. DESIGN.md's
 *    motion section says every motion collapses to none, and an eased scroll
 *    is motion the reader did not ask for.
 * 2. Nested scroll areas. The mobile nav panel, the ask drawer's body and the
 *    contents rail each scroll independently; `data-lenis-prevent` on those
 *    hands the wheel back to the browser inside them.
 * 3. The body scroll lock. `globals.css` sets `body { overflow: hidden }` while
 *    the drawer is open, and a scroller running behind that lock moves a page
 *    the reader cannot see. The drawer provider calls `pauseScroller`.
 */
export function SmoothScrollProvider() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      // 1.05s to settle: long enough to read as momentum, short enough that a
      // reader who flicks twice is not waiting on the first flick.
      duration: 1.05,
      // Exponential ease-out. The default is close to this; naming it means the
      // curve is a decision in the repository rather than a library default.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices already have momentum from the OS, and doubling it feels
      // like lag rather than polish.
      smoothWheel: true,
      syncTouch: false,
      // A wheel notch should cover about as much ground as it does natively.
      wheelMultiplier: 1,
    });

    setScroller(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      setScroller(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
