import { useCallback, useEffect, useEffectEvent, useState } from 'react'

interface LightboxItem {
  id: string
}

interface UseLightboxReturn<T extends LightboxItem> {
  currentItem: T | null
  currentIndex: number
  open: (item: T, index: number) => void
  close: () => void
  goToPrevious: () => void
  goToNext: () => void
}

/**
 * The open position is the only state; the item is derived from it.
 *
 * This kept `currentItem` and `currentIndex` as two pieces of state updated
 * side by side (rerender-derived-state), with navigation callbacks closed over
 * the index (rerender-functional-setstate), and re-subscribed its keydown
 * listener on every step through the gallery (advanced-event-handler-refs).
 */
export function useLightbox<T extends LightboxItem>(items: T[]): UseLightboxReturn<T> {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const currentItem = currentIndex >= 0 ? (items[currentIndex] ?? null) : null
  const isOpen = currentItem !== null
  const lastIndex = items.length - 1

  const open = useCallback(
    (item: T, index: number) => {
      setCurrentIndex(index >= 0 ? index : items.indexOf(item))
    },
    [items]
  )

  const close = useCallback(() => {
    setCurrentIndex(-1)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((index) => (index > 0 ? index - 1 : index))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((index) => (index >= 0 && index < lastIndex ? index + 1 : index))
  }, [lastIndex])

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        close()
        return
      case 'ArrowLeft':
        goToPrevious()
        return
      case 'ArrowRight':
        goToNext()
        return
      default:
        return
    }
  })

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => onKeyDown(event)
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return { currentItem, currentIndex, open, close, goToPrevious, goToNext }
}
