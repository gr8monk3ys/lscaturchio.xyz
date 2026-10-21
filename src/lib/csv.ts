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

/** Quote a cell iff it contains a comma, quote, or newline (RFC 4180). */
function serializeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Serialize header-keyed records back to CSV text, preserving column order:
 * missing keys become empty cells, and cells containing commas, quotes, or
 * newlines are quoted.
 */
function serializeCsv(headers: string[], records: Record<string, string>[]): string {
  const lines = [headers.map(serializeCell).join(',')];
  for (const record of records) {
    lines.push(headers.map((h) => serializeCell(record[h] ?? '')).join(','));
  }
  return lines.join('\n') + '\n';
}

/** The header row and the header-keyed records of a CSV document. */
function parseDocument(text: string): { headers: string[]; records: Record<string, string>[] } {
  const rows = parseRows(text.trim());
  const headers = (rows[0] ?? []).map((h) => h.trim());
  if (rows.length < 2) return { headers, records: [] };

  const records = rows
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = (row[index] ?? '').trim();
      });
      return record;
    });
  return { headers, records };
}

/**
 * Parse CSV text into header-keyed records. Cells are trimmed, missing trailing
 * columns become empty strings, and rows that are entirely empty are dropped.
 */
export function parseCsv(text: string): Record<string, string>[] {
  return parseDocument(text).records;
}

/**
 * One CSV file's schema: the mapping between its column names and the field
 * names code uses, in both directions. The column names are spelled once, in
 * `defineCsvTable`, and nowhere else — reader and writer both go through here.
 */
export interface CsvTable<F extends string> {
  /** Column names in file order. */
  readonly columns: readonly string[];
  /**
   * Rows as field-keyed records. Every field is present; a column the file
   * lacks reads as ''. With `strict`, a header row that differs from
   * `columns` throws instead — a writer must not silently drop a column.
   */
  parse(text: string, options?: { strict?: boolean }): Record<F, string>[];
  /** The inverse of `parse`: records back to CSV text in column order, LF-terminated. */
  serialize(records: readonly Record<F, string>[]): string;
  /** A record with every field empty, for building a new row. */
  empty(): Record<F, string>;
}

/** The record type a `CsvTable` parses to and serializes from. */
export type CsvRecord<T> = T extends CsvTable<infer F> ? Record<F, string> : never;

/** Define a CSV table from `{ field: 'Column Name' }`, in column order. */
export function defineCsvTable<F extends string>(columnsByField: Record<F, string>): CsvTable<F> {
  const fields = Object.keys(columnsByField) as F[];
  const columns = fields.map((field) => columnsByField[field]);

  return {
    columns,
    parse(text, { strict = false } = {}) {
      const { headers, records } = parseDocument(text);
      if (strict && headers.join(',') !== columns.join(',')) {
        throw new Error(
          `CSV header mismatch: expected "${columns.join(',')}", found "${headers.join(',')}"`,
        );
      }
      return records.map((row) => {
        const record = {} as Record<F, string>;
        for (const field of fields) record[field] = row[columnsByField[field]] ?? '';
        return record;
      });
    },
    empty() {
      return Object.fromEntries(fields.map((field) => [field, ''])) as Record<F, string>;
    },
    serialize(records) {
      return serializeCsv(
        columns,
        records.map((record) => {
          const row: Record<string, string> = {};
          for (const field of fields) row[columnsByField[field]] = record[field] ?? '';
          return row;
        }),
      );
    },
  };
}
