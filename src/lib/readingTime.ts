// Rule: TypeScript Usage - Use TypeScript for all code
// Rule: Utility functions - Helper function for reading time calculation

/**
 * Calculate reading time for given text content
 * @param content Text content to calculate reading time for
 * @param wordsPerMinute Reading speed in words per minute (default: 200)
 * @returns Object containing minutes, seconds and text representation
 */
export function calculateReadingTime(content: string, wordsPerMinute = 200): {
  minutes: number;
  seconds: number;
  text: string;
} {
  // Strip HTML tags if present
  const cleanText = content.replace(/<\/?[^>]+(>|$)/g, "");
  
  // Count words by splitting on whitespace
  const words = cleanText.trim().split(/\s+/).length;
  
  // Calculate reading time
  const minutes = Math.floor(words / wordsPerMinute);
  const seconds = Math.floor((words % wordsPerMinute) / (wordsPerMinute / 60));
  
  // Generate text representation
  let text = "";
  if (minutes > 0) {
    text += `${minutes} min`;
    if (seconds > 0) text += ` ${seconds} sec`;
  } else {
    text += `${seconds} sec`;
  }
  
  return {
    minutes,
    seconds,
    text: `${text} read`
  };
}
