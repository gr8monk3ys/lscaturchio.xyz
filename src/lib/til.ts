/**
 * TIL (Today I Learned) data management
 * In the future, this could be replaced with a CMS or database
 */

export interface TILItem {
  id: string
  title: string
  content: string
  date: string
  tags: string[]
  category: 'code' | 'ai' | 'design' | 'productivity' | 'other'
  url?: string
  featured?: boolean
}

/**
 * Load all TIL items
 * TODO: Replace with actual data source (JSON file, CMS, or database)
 */
export async function getAllTILs(): Promise<TILItem[]> {
  // This would fetch from a JSON file or API
  return []
}

/**
 * Get featured TIL items for homepage
 */
export async function getFeaturedTILs(limit: number = 3): Promise<TILItem[]> {
  const all = await getAllTILs()
  return all.filter(item => item.featured).slice(0, limit)
}

/**
 * Get TILs by category
 */
export async function getTILsByCategory(category: string): Promise<TILItem[]> {
  const all = await getAllTILs()
  return all.filter(item => item.category === category)
}

/**
 * Get TILs by tag
 */
export async function getTILsByTag(tag: string): Promise<TILItem[]> {
  const all = await getAllTILs()
  return all.filter(item => item.tags.includes(tag))
}
