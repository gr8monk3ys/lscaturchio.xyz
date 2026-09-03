"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl neu-flat" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl neu-button transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label="Toggle theme"
    >
      {/* One Pen Rule: muted at rest, Forest Ink on hover/focus. */}
      <Sun className="h-5 w-5 rotate-0 scale-100 text-muted-foreground transition-all group-hover:text-primary group-focus-visible:text-primary dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 text-muted-foreground transition-all group-hover:text-primary group-focus-visible:text-primary dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
