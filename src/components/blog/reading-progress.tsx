"use client"

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [isVisible, setIsVisible] = useState(false)
  const [scaleX, setScaleX] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0
      const clamped = Math.max(0, Math.min(1, progress))
      setScaleX(clamped)
      setIsVisible(clamped > 0.05)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
      style={{
        transform: `scaleX(${scaleX})`,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    />
  )
}
