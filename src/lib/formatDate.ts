// One formatter for every call. `formatDate` runs once per essay row, and
// constructing an Intl.DateTimeFormat is the expensive part of formatting.
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(`${date}T00:00:00Z`) : date;
  return DATE_FORMATTER.format(d);
}
