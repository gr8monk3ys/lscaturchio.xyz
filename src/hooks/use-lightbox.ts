import { useCallback, useEffect, useState } from 'react'

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

export function useLightbox<T extends LightboxItem>(items: T[]): UseLightboxReturn<T> {
  const [currentItem, setCurrentItem] = useState<T | null>(null)
  const [currentIndex, setCurrentIndex] = useState(-1)

  const open = useCallback((item: T, index: number) => {
    setCurrentItem(item)
    setCurrentIndex(index)
  }, [])

  const close = useCallback(() => {
    setCurrentItem(null)
    setCurrentIndex(-1)
  }, [])

  const goToPrevious = useCallback(() => {
    if (currentIndex <= 0) return
    const nextIndex = currentIndex - 1
    setCurrentIndex(nextIndex)
    setCurrentItem(items[nextIndex] ?? null)
  }, [items, currentIndex])

  const goToNext = useCallback(() => {
    if (currentIndex >= items.length - 1) return
    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)
    setCurrentItem(items[nextIndex] ?? null)
  }, [items, currentIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentItem) return
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
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close, goToNext, goToPrevious, currentItem])

  return { currentItem, currentIndex, open, close, goToPrevious, goToNext }
}
