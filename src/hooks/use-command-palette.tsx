'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { FileText, Moon, Sun } from 'lucide-react'
import { paletteDestinations } from '@/constants/navlinks'
import { safeStorage } from '@/lib/storage'
import type {
  CommandGroups,
  CommandItem,
  PaletteAction,
  PaletteState,
  SearchResult,
} from '@/components/ui/command-palette/types'

/**
 * Extra search terms per destination, keyed by href.
 *
 * These are deliberately *not* names. A keyword lets "portfolio" or "gpt" find
 * a row without printing either word on screen, which is how the palette can
 * stay searchable by the words people guess while still showing only the one
 * name the rest of the site uses. Anything absent here simply has no synonyms.
 */
const SEARCH_KEYWORDS: Record<string, string[]> = {
  '/': ['main', 'index', 'start', 'homepage'],
  '/about': ['bio', 'profile', 'me', 'who'],
  '/professional': ['hire', 'resume', 'cv', 'work with me', 'experience'],
  '/projects': ['work', 'portfolio', 'showcase', 'built'],
  '/blog': ['articles', 'posts', 'writing', 'essays'],
  '/series': ['collection', 'tutorials'],
  '/topics': ['tags', 'subjects', 'hubs'],
  '/contact': ['email', 'message', 'reach', 'get in touch'],
  '/chat': ['ai', 'assistant', 'ask', 'gpt'],
  '/bookmarks': ['saved', 'favorites', 'later', 'reading list'],
  '/garden': ['media', 'logs'],
  '/lab': ['demos', 'experiments', 'playground'],
  '/uses': ['setup', 'tools', 'gear'],
  '/now': ['current', 'lately'],
  '/books': ['reading', 'goodreads'],
  '/movies': ['films', 'letterboxd'],
  '/music': ['listening', 'spotify', 'records'],
  '/photos': ['photography', 'pictures'],
  '/podcast': ['audio', 'episodes'],
  '/changelog': ['releases', 'roadmap', 'updates'],
  '/work-with-me': ['consulting', 'contract', 'freelance'],
  '/links': ['elsewhere', 'social'],
  '/guestbook': ['sign', 'note'],
}

const INITIAL_STATE: PaletteState = {
  isOpen: false,
  query: '',
  selectedIndex: 0,
  recentSearches: [],
  searchResults: [],
  isSearching: false,
}

function paletteReducer(state: PaletteState, action: PaletteAction): PaletteState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true }
    case 'CLOSE':
      return {
        ...state,
        isOpen: false,
        query: '',
        searchResults: [],
        selectedIndex: 0,
        isSearching: false,
      }
    case 'SET_QUERY':
      return { ...state, query: action.query, selectedIndex: 0 }
    case 'SET_SELECTED_INDEX':
      return { ...state, selectedIndex: action.index }
    case 'SET_RECENT_SEARCHES':
      return { ...state, recentSearches: action.searches }
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.results, selectedIndex: 0 }
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.value }
    case 'CLEAR_QUERY':
      return {
        ...state,
        query: '',
        searchResults: [],
        selectedIndex: 0,
        isSearching: false,
      }
    case 'CLEAR_RESULTS':
      return {
        ...state,
        searchResults: [],
        selectedIndex: 0,
        isSearching: false,
      }
    default:
      return state
  }
}

function groupCommands(commands: CommandItem[]): CommandGroups {
  const groups: CommandGroups = {
    navigation: [],
    action: [],
    blog: [],
  }

  commands.forEach((command) => {
    groups[command.category].push(command)
  })

  return groups
}

function focusNextFrame(callback: () => void): void {
  if (typeof window === 'undefined') return
  window.requestAnimationFrame(callback)
}

export type CommandPaletteModel = {
  activeSelectedIndex: number
  clearQuery: () => void
  closePalette: () => void
  commandCount: number
  executeCommand: (command: CommandItem) => void
  groupedCommands: CommandGroups
  inputRef: React.RefObject<HTMLInputElement | null>
  isOpen: boolean
  isSearching: boolean
  listRef: React.RefObject<HTMLDivElement | null>
  openPalette: () => void
  query: string
  setQuery: (value: string) => void
  setSelectedIndex: (index: number) => void
}

export function useCommandPalette(): CommandPaletteModel {
  const [state, dispatch] = useReducer(paletteReducer, INITIAL_STATE)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const { isOpen, isSearching, query, recentSearches, searchResults, selectedIndex } = state

  useEffect(() => {
    const saved = safeStorage.getJSON<string[]>('command-palette-recent')
    if (saved) {
      dispatch({ type: 'SET_RECENT_SEARCHES', searches: saved })
    }
  }, [])

  const saveRecentSearch = useCallback(
    (search: string) => {
      if (!search.trim()) return
      const updated = [search, ...recentSearches.filter((item) => item !== search)].slice(0, 5)
      safeStorage.setJSON('command-palette-recent', updated)
      dispatch({ type: 'SET_RECENT_SEARCHES', searches: updated })
    },
    [recentSearches]
  )

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      dispatch({ type: 'CLEAR_RESULTS' })
      return
    }

    dispatch({ type: 'SET_SEARCHING', value: true })
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) {
        dispatch({ type: 'SET_SEARCH_RESULTS', results: [] })
        return
      }

      const data = (await response.json()) as { results?: SearchResult[] }
      dispatch({ type: 'SET_SEARCH_RESULTS', results: data.results ?? [] })
    } catch {
      dispatch({ type: 'SET_SEARCH_RESULTS', results: [] })
    } finally {
      dispatch({ type: 'SET_SEARCHING', value: false })
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        void performSearch(query.trim())
      } else {
        dispatch({ type: 'CLEAR_RESULTS' })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const focusInput = useCallback(() => {
    focusNextFrame(() => inputRef.current?.focus())
  }, [])

  const openPalette = useCallback(() => {
    dispatch({ type: 'OPEN' })
    focusInput()
  }, [focusInput])

  const closePalette = useCallback(() => {
    dispatch({ type: 'CLOSE' })
  }, [])

  const clearQuery = useCallback(() => {
    dispatch({ type: 'CLEAR_QUERY' })
    focusInput()
  }, [focusInput])

  /**
   * Built from `paletteDestinations`, not from a list of its own.
   *
   * This hook used to declare eight destinations with its own labels and its
   * own copy, which made it a third navigation: `/blog` was "Blog" here and
   * "Writing" in the header and footer, `/chat` was "AI Chat" against the
   * footer's "Chat", and `/professional` — promoted as "Hire me" by both navs —
   * could not be reached at all. Twenty-two of roughly thirty destinations were
   * missing. The descriptions ("View my portfolio projects", "Read my
   * articles") were in a possessive-marketing voice that appears nowhere else
   * on a site whose own register is "Mostly arguments."
   *
   * Keywords stay here because they are a search concern, not a naming one:
   * they let "portfolio" find Projects without putting that word on screen.
   */
  const navigationCommands = useMemo<CommandItem[]>(
    () =>
      paletteDestinations.map((destination) => {
        const Icon = destination.icon ?? FileText
        return {
          id: `nav-${destination.href}`,
          title: destination.name,
          description: destination.description,
          icon: <Icon className="h-4 w-4" />,
          category: 'navigation' as const,
          action: () => router.push(destination.href),
          keywords: SEARCH_KEYWORDS[destination.href] ?? [],
        }
      }),
    [router]
  )

  const actionCommands = useMemo<CommandItem[]>(
    () => [
      {
        id: 'toggle-theme',
        // Sentence case. These were the palette's two Title Case strings, and
        // the heading-case rule cannot see a command title.
        title: theme === 'dark' ? 'Switch to light' : 'Switch to dark',
        description: 'Change the paper',
        icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        category: 'action',
        action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        keywords: ['theme', 'dark', 'light', 'mode', 'appearance'],
      },
    ],
    [setTheme, theme]
  )

  const blogCommands = useMemo<CommandItem[]>(
    () =>
      searchResults.map((result) => ({
        id: `blog-${result.slug}`,
        title: result.title,
        description: result.description,
        icon: <FileText className="h-4 w-4" />,
        category: 'blog',
        action: () => {
          saveRecentSearch(result.title)
          router.push(`/blog/${result.slug}`)
        },
        keywords: result.tags ?? [],
      })),
    [router, saveRecentSearch, searchResults]
  )

  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return [...navigationCommands, ...actionCommands]
    }

    const lowerQuery = query.toLowerCase()
    const baseCommands = [...navigationCommands, ...actionCommands].filter((command) => {
      const titleMatch = command.title.toLowerCase().includes(lowerQuery)
      const descriptionMatch = command.description?.toLowerCase().includes(lowerQuery)
      const keywordMatch = command.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(lowerQuery)
      )
      return titleMatch || descriptionMatch || keywordMatch
    })

    return [...baseCommands, ...blogCommands]
  }, [actionCommands, blogCommands, navigationCommands, query])

  const groupedCommands = useMemo(() => groupCommands(filteredCommands), [filteredCommands])
  const commandCount = filteredCommands.length
  const activeSelectedIndex = commandCount === 0
    ? 0
    : Math.min(selectedIndex, commandCount - 1)

  const executeCommand = useCallback(
    (command: CommandItem) => {
      command.action()
      closePalette()
    },
    [closePalette]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (isOpen) {
          closePalette()
        } else {
          openPalette()
        }
        return
      }

      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          closePalette()
          return
        case 'ArrowDown':
          event.preventDefault()
          if (commandCount === 0) return
          dispatch({
            type: 'SET_SELECTED_INDEX',
            index: activeSelectedIndex < commandCount - 1 ? activeSelectedIndex + 1 : 0,
          })
          return
        case 'ArrowUp':
          event.preventDefault()
          if (commandCount === 0) return
          dispatch({
            type: 'SET_SELECTED_INDEX',
            index: activeSelectedIndex > 0 ? activeSelectedIndex - 1 : commandCount - 1,
          })
          return
        case 'Enter':
          event.preventDefault()
          executeCommand(filteredCommands[activeSelectedIndex])
          return
        default:
          return
      }
    },
    [activeSelectedIndex, closePalette, commandCount, executeCommand, filteredCommands, isOpen, openPalette]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (!isOpen || !listRef.current || commandCount === 0) return
    const selectedElement = listRef.current.querySelector(`[data-index="${activeSelectedIndex}"]`)
    selectedElement?.scrollIntoView({ block: 'nearest' })
  }, [activeSelectedIndex, commandCount, isOpen])

  return {
    activeSelectedIndex,
    clearQuery,
    closePalette,
    commandCount,
    executeCommand,
    groupedCommands,
    inputRef,
    isOpen,
    isSearching,
    listRef,
    openPalette,
    query,
    setQuery: (value: string) => dispatch({ type: 'SET_QUERY', query: value }),
    setSelectedIndex: (index: number) => dispatch({ type: 'SET_SELECTED_INDEX', index }),
  }
}
