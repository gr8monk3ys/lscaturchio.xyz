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

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || target.matches('input, textarea, select')
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

  // Arrow keys page through the set. Escape is not here: the lightbox is a
  // modal, and `useModalOverlay` owns Escape for every modal. A second
  // listener here ignored which overlay was on top, so with ⌘K's palette open
  // over the lightbox one Escape closed both.
  //
  // Arrows inside a text field belong to the field. ⌘K opens the palette over
  // the lightbox, and Left/Right in its input moved the caret AND paged the
  // photo underneath.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentItem) return
      if (isEditable(event.target)) return
      switch (event.key) {
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
  }, [goToNext, goToPrevious, currentItem])

  return { currentItem, currentIndex, open, close, goToPrevious, goToNext }
}
