"use client"

import { useEffect, useRef } from 'react'

/**
 * The bar is written straight to the DOM from the scroll handler.
 *
 * Its position is a transient value that changes on every scroll event, and it
 * used to live in two pieces of state, so every scroll re-rendered the
 * component to move one transform (rerender-use-ref-transient-values). Nothing
 * else reads it, so a ref is the whole requirement.
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const bar = barRef.current
      if (!bar) return
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0
      const clamped = Math.max(0, Math.min(1, progress))
      bar.style.transform = `scaleX(${clamped})`
      bar.style.opacity = clamped > 0.05 ? '1' : '0'
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
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
      style={{
        transform: 'scaleX(0)',
        opacity: 0,
        transition: "opacity 0.2s ease",
      }}
    />
  )
}
