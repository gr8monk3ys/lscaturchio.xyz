/**
 * RFC 4180-ish CSV parsing for the committed data exports in `public/my-data`.
 *
 * The Letterboxd and Goodreads exports both quote free-text fields (reviews,
 * notes) that may contain commas *and literal newlines*. Splitting the file on
 * `\n` before parsing — the obvious approach — silently shreds those records
 * and shifts every subsequent column, so the parser has to walk characters and
 * track quote state instead.
 */

/** Split CSV text into rows of raw cells, honouring quoted newlines and `""` escapes. */
function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        // A doubled quote inside a quoted field is a literal quote.
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }

  // Flush a trailing row that has no terminating newline.
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

/**
 * Parse CSV text into header-keyed records. Cells are trimmed, missing trailing
 * columns become empty strings, and rows that are entirely empty are dropped.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const rows = parseRows(text.trim());
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = (row[index] ?? '').trim();
      });
      return record;
    });
}
