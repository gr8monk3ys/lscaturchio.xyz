import { useEffect, useEffectEvent } from 'react'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}

type UseGalleryKeyboardOptions = {
  activeSlug: string
  browseMode: boolean
  linkRefs: React.MutableRefObject<Record<string, HTMLAnchorElement | null>>
  slugs: string[]
  onSetSlug: (slug: string) => void
  onToggleBrowse: () => void
  onExitBrowse: () => void
}

export function useGalleryKeyboard({
  activeSlug,
  browseMode,
  linkRefs,
  slugs,
  onSetSlug,
  onToggleBrowse,
  onExitBrowse,
}: UseGalleryKeyboardOptions): void {
  // One window listener for the life of the gallery. It re-subscribed on
  // every active-project change (and mirrored `slugs` into a ref by hand);
  // an Effect Event reads the latest values instead
  // (advanced-event-handler-refs / advanced-use-latest).
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (isTypingTarget(e.target)) return
    if (e.metaKey || e.ctrlKey || e.altKey) return

    if (e.key === 'b' || e.key === 'B') {
      e.preventDefault()
      onToggleBrowse()
      return
    }

    if (!browseMode) return
    const list = slugs
    if (list.length === 0) return

    if (e.key === 'Escape') {
      e.preventDefault()
      onExitBrowse()
      return
    }

    const index = Math.max(0, list.findIndex((s) => s === activeSlug))
    const move = (delta: number) => {
      const i = Math.min(list.length - 1, Math.max(0, index + delta))
      onSetSlug(list[i])
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
      e.preventDefault()
      move(1)
      return
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
      e.preventDefault()
      move(-1)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!activeSlug) return
      linkRefs.current[activeSlug]?.click()
    }
  })

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])
}
