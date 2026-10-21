"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

/**
 * Renders the real control on the first paint, not a box shaped like one.
 *
 * This used to hold a `mounted` flag and render `<div className="w-10 h-10
 * rounded-xl neu-flat" />` until an effect ran: a toggle-shaped object with no
 * accessible name, not focusable, not in the a11y tree. A review found it and
 * the identical box one layer up and called them decoys, which is right — they
 * looked interactive and were not.
 *
 * The flag was never needed for the icons: the sun/moon swap is CSS (`dark:`
 * variants), not state. It existed only so the click handler could read the
 * theme after hydration — but the handler cannot run before hydration, so
 * nothing had to be deferred to make that safe.
 */
export function ThemeToggle() {
  // `resolvedTheme`, not `theme`: it is the value actually applied, so
  // "system" resolves rather than falling through to the wrong branch. It is
  // undefined during SSR, which costs nothing — a click cannot happen before
  // hydration, and the button's markup does not depend on it.
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl neu-button transition-colors"
      aria-label="Toggle theme"
    >
      {/* One Pen Rule: muted at rest, Forest Ink on hover/focus. */}
      {/* The rotate/scale swap runs on a wrapper span, not on the SVG, so it
          is composited (rendering-animate-svg-wrapper); the SVG keeps only its
          colour transition. */}
      <span aria-hidden="true" className="flex rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0">
        <Sun className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary" />
      </span>
      <span aria-hidden="true" className="absolute flex rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100">
        <Moon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary" />
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
