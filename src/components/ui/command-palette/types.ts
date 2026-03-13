export type CommandCategory = 'navigation' | 'blog' | 'action'

export interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  category: CommandCategory
  action: () => void
  keywords?: string[]
}

export interface SearchResult {
  slug: string
  title: string
  description: string
  relevance: number
  date: string
  tags: string[]
}

export interface CommandPaletteProps {
  className?: string
}

export type CommandGroups = Record<CommandCategory, CommandItem[]>

export type PaletteState = {
  isOpen: boolean
  query: string
  selectedIndex: number
  recentSearches: string[]
  searchResults: SearchResult[]
  isSearching: boolean
}

export type PaletteAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SET_QUERY'; query: string }
  | { type: 'SET_SELECTED_INDEX'; index: number }
  | { type: 'SET_RECENT_SEARCHES'; searches: string[] }
  | { type: 'SET_SEARCH_RESULTS'; results: SearchResult[] }
  | { type: 'SET_SEARCHING'; value: boolean }
  | { type: 'CLEAR_QUERY' }
  | { type: 'CLEAR_RESULTS' }
