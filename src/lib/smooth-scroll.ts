/**
 * The site's one scroll authority.
 *
 * Smooth scrolling has to be a single owner or it becomes a fight. Before this
 * module there were four independent `behavior: "smooth"` calls — the
 * back-to-top button, the project gallery's keyboard navigation, the contents
 * rail, the chat autoscroll — and three of the four ignored
 * `prefers-reduced-motion`, against DESIGN.md's own line that "every motion
 * collapses to none". Adding a global scroller on top of those would have made
 * four fights instead of one.
 *
 * Everything that wants to move the page goes through `scrollToY` or
 * `scrollToElement`. Both fall back to an instant jump when the reader asks for
 * reduced motion, and both work whether or not the global scroller is running.
 */

import type Lenis from "lenis";

/** The live instance, or null when reduced motion is on or hydration is pending. */
let instance: Lenis | null = null;

export function setScroller(next: Lenis | null): void {
  instance = next;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The fixed header's height, which every anchor has to clear.
 *
 * Eight sections carry `scroll-mt-28` (112px) for exactly this reason. CSS
 * `scroll-margin-top` is honoured by native `scrollIntoView` and ignored by a
 * library's own `scrollTo`, so the offset has to be passed explicitly or every
 * anchor lands underneath the navbar.
 */
export const HEADER_OFFSET = 112;

/** Scroll to an absolute Y. Instant under reduced motion. */
export function scrollToY(y: number, options?: { immediate?: boolean }): void {
  const immediate = options?.immediate || prefersReducedMotion();

  if (instance && !immediate) {
    instance.scrollTo(y);
    return;
  }

  window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

/**
 * Scroll an element into view under the fixed header.
 *
 * `offset` defaults to the header height. Pass 0 for a target that is already
 * inside a scroll container of its own.
 */
export function scrollToElement(
  target: Element | string,
  options?: { offset?: number; immediate?: boolean }
): void {
  const element =
    typeof target === "string" ? document.getElementById(target) : target;
  if (!element) return;

  const immediate = options?.immediate || prefersReducedMotion();
  const offset = options?.offset ?? HEADER_OFFSET;

  if (instance && !immediate) {
    instance.scrollTo(element as HTMLElement, { offset: -offset });
    return;
  }

  // Native path: `scroll-margin-top` on the target already accounts for the
  // header, so do not subtract it twice.
  element.scrollIntoView({
    behavior: immediate ? "auto" : "smooth",
    block: "start",
  });
}

/**
 * Pause the global scroller.
 *
 * `globals.css` locks `body { overflow: hidden }` while the ask drawer is open.
 * A scroller that keeps running behind that lock scrolls a page the reader
 * cannot see, and restores to the wrong position when the drawer closes.
 */
export function pauseScroller(): void {
  instance?.stop();
}

export function resumeScroller(): void {
  instance?.start();
}
