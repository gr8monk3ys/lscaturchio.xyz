// Rule: TypeScript Usage - Use TypeScript for all code with explicit types
export function formatDate(date: Date | string): string {
  // Handle string dates by converting to Date object
  const dateObj = typeof date === 'string' ? new Date(`${date}T00:00:00Z`) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(dateObj);
}
