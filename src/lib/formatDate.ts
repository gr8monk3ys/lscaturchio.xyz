export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(`${date}T00:00:00Z`) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}
