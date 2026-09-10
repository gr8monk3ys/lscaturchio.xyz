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
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl neu-button transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
      aria-label="Toggle theme"
    >
      {/* One Pen Rule: muted at rest, Forest Ink on hover/focus. */}
      <Sun className="h-5 w-5 rotate-0 scale-100 text-muted-foreground transition-all group-hover:text-primary group-focus-visible:text-primary dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 text-muted-foreground transition-all group-hover:text-primary group-focus-visible:text-primary dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
