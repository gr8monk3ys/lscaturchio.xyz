// Rule: TypeScript Usage - Use TypeScript for all code
"use client"

import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { useEffect, useState } from "react"

export function ThemeProviderClient({
  children,
}: {
  children: React.ReactNode
}): JSX.Element | null {
  const [mounted, setMounted] = useState(false)

  // useEffect runs on the client, so we can safely access localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  // To avoid hydration mismatch, only render the children when mounted
  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="lorenzo-theme">
      {children}
    </ThemeProvider>
  )
}
