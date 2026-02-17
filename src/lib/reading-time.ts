/**
 * Calculate estimated reading time for text content
 * @param text - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns Object with minutes and text representation
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200) {
  // Remove code blocks and HTML tags for more accurate word count
  let cleanText = text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks

  // Remove HTML tags — loop to handle nested/malformed tags like `<scr<script>ipt>`
  let prev = ''
  while (prev !== cleanText) {
    prev = cleanText
    cleanText = cleanText.replace(/<[^>]*>/g, '')
  }

  cleanText = cleanText.replace(/[#*_`]/g, '') // Remove markdown symbols

  const words = cleanText.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)

  return {
    words,
    minutes,
    text: `${minutes} min read`,
  }
}

/**
 * Format reading time for display
 * @param minutes - Number of minutes
 * @returns Formatted string
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min read'
  if (minutes === 1) return '1 min read'
  return `${minutes} min read`
}
