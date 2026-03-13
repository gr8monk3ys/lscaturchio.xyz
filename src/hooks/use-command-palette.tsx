'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  FileText,
  Home,
  User,
  Briefcase,
  Mail,
  Moon,
  Sun,
  MessageSquare,
  BookOpen,
  Bookmark,
  TrendingUp,
} from 'lucide-react'
import { safeStorage } from '@/lib/storage'
import type {
  CommandCategory,
  CommandGroups,
  CommandItem,
  PaletteAction,
  PaletteState,
  SearchResult,
} from '@/components/ui/command-palette/types'

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

  const navigationCommands = useMemo<CommandItem[]>(
    () => [
      {
        id: 'home',
        title: 'Home',
        description: 'Go to homepage',
        icon: <Home className="h-4 w-4" />,
        category: 'navigation',
        action: () => router.push('/'),
        keywords: ['main', 'index', 'start'],
      },
      {
        id: 'about',
        title: 'About',
        description: 'Learn more about me',
        icon: <User className="h-4 w-4" />,
        category: 'navigation',
        action: () => router.push('/about'),
        keywords: ['bio', 'profile', 'me'],
      },
      {
        id: 'projects',
        title: 'Projects',
        description: 'View my portfolio projects',
        icon: <Briefcase className="h-4 w-4" />,
        category: 'navigation',
        action: () => router.push('/projects'),
        keywords: ['work', 'portfolio', 'showcase'],
      },
      {
        id: 'blog',
        title: 'Blog',
        description: 'Read my articles',
        icon: <BookOpen className="h-4 w-4" />,
        category: 'navigation',
        action: () => router.push('/blog'),
        keywords: ['articles', 'posts', 'writing'],
      },
      {
        id: 'series',
        title: 'Series',
        description: 'Browse blog series',
        icon: <TrendingUp className="h-4 w-4" />,
        category: 'navigation',
        action: () => router.push('/series'),
        keywords: ['collection', 'tutorials'],
      },
      {
        id: 'contact',
        title: 'Contact',
        description: 'Get in touch',
        icon: <Mail className="h-4 w-4" />,
        category: 'navigation',
        action: () => router.push('/contact'),
        keywords: ['email', 'message', 'reach'],
      },
      {
        id: 'chat',
        title: 'AI Chat',
        description: 'Chat with my AI assistant',
        icon: <MessageSquare className="h-4 w-4" />,
        category: 'navigation',
        action: () => router.push('/chat'),
        keywords: ['ai', 'assistant', 'help', 'gpt'],
      },
      {
        id: 'bookmarks',
        title: 'Bookmarks',
        description: 'View saved posts',
        icon: <Bookmark className="h-4 w-4" />,
        category: 'navigation',
        action: () => router.push('/bookmarks'),
        keywords: ['saved', 'favorites', 'later'],
      },
    ],
    [router]
  )

  const actionCommands = useMemo<CommandItem[]>(
    () => [
      {
        id: 'toggle-theme',
        title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        description: 'Toggle theme appearance',
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
