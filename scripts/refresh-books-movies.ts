/**
 * Refresh the committed Letterboxd/Goodreads CSVs from their public RSS feeds.
 *
 * Dry-run by default (prints what would change); pass --write to apply.
 * Feeds carry only recent history, so this keeps the exports current between
 * full manual exports — it cannot backfill a long gap.
 *
 *   npx tsx scripts/refresh-books-movies.ts           # report only
 *   npx tsx scripts/refresh-books-movies.ts --write   # apply changes
 */
import fs from 'fs';
import path from 'path';
import { parseCsv, serializeCsv } from '../src/lib/csv';
import {
  parseLetterboxdRss,
  parseGoodreadsRss,
  mergeDiary,
  mergeRatings,
  mergeWatched,
  mergeReviews,
  upsertGoodreads,
  type MergeResult,
} from '../src/lib/media-refresh';

const LETTERBOXD_RSS = 'https://letterboxd.com/gr8monk3ys/rss/';
const GOODREADS_USER_ID = '168274083';
const GOODREADS_SHELVES = ['read', 'currently-reading', 'to-read'];

const LETTERBOXD_DIR = path.join(process.cwd(), 'public/my-data/letterboxd');
const GOODREADS_CSV = path.join(
  process.cwd(),
  'public/my-data/goodreads/goodreads_library_export.csv',
);

const write = process.argv.includes('--write');
let changes = 0;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

/** Header order comes from the file itself so serialization round-trips. */
function readCsv(file: string): { headers: string[]; rows: Record<string, string>[] } {
  const text = fs.readFileSync(file, 'utf-8');
  const headers = text.slice(0, text.indexOf('\n')).split(',').map((h) => h.trim());
  return { headers, rows: parseCsv(text) };
}

function apply(
  file: string,
  headers: string[],
  result: MergeResult<Record<string, string>>,
  label: string,
) {
  const delta = result.added + result.updated;
  changes += delta;
  if (delta === 0) {
    console.log(`  ${label}: no changes`);
    return;
  }
  console.log(`  ${label}: +${result.added} added, ~${result.updated} updated`);
  if (write) {
    fs.writeFileSync(file, serializeCsv(headers, result.rows));
  }
}

async function main() {
  console.log(`Mode: ${write ? 'write' : 'dry-run (pass --write to apply)'}`);

  console.log('Letterboxd:');
  const entries = parseLetterboxdRss(await fetchText(LETTERBOXD_RSS));
  console.log(`  feed: ${entries.length} diary entries`);
  for (const [file, merge] of [
    ['diary.csv', mergeDiary],
    ['ratings.csv', mergeRatings],
    ['watched.csv', mergeWatched],
    ['reviews.csv', mergeReviews],
  ] as const) {
    const filePath = path.join(LETTERBOXD_DIR, file);
    const { headers, rows } = readCsv(filePath);
    apply(filePath, headers, merge(rows, entries), file);
  }

  console.log('Goodreads:');
  const books = [];
  for (const shelf of GOODREADS_SHELVES) {
    const xml = await fetchText(
      `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=${shelf}`,
    );
    const parsed = parseGoodreadsRss(xml, shelf);
    console.log(`  feed ${shelf}: ${parsed.length} items`);
    books.push(...parsed);
  }
  const { headers, rows } = readCsv(GOODREADS_CSV);
  apply(GOODREADS_CSV, headers, upsertGoodreads(rows, books), 'library export');

  console.log('');
  console.log(
    changes === 0
      ? 'Everything up to date.'
      : `${changes} change(s) ${write ? 'written' : 'found — re-run with --write to apply'}.`,
  );
}

main().catch((error) => {
  console.error('Refresh failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
