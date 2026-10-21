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
import type { CsvTable } from '../src/lib/csv';
import {
  parseLetterboxdRss,
  diaryTable,
  ratingsTable,
  watchedTable,
  reviewsTable,
} from '../src/lib/letterboxd-format';
import { parseGoodreadsRss, libraryTable } from '../src/lib/goodreads-format';
import {
  datedEntries,
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

/**
 * Read one export through its table, merge, and (with --write) serialize it
 * back. The parse is strict: a full export whose columns no longer match the
 * table fails here instead of losing a column on write.
 */
function refresh<F extends string, E>(
  file: string,
  table: CsvTable<F>,
  merge: (rows: Record<F, string>[], entries: E[]) => MergeResult<Record<F, string>>,
  entries: E[],
  label: string,
) {
  const result = merge(table.parse(fs.readFileSync(file, 'utf-8'), { strict: true }), entries);
  const delta = result.added + result.updated;
  changes += delta;
  if (delta === 0) {
    console.log(`  ${label}: no changes`);
    return;
  }
  console.log(`  ${label}: +${result.added} added, ~${result.updated} updated`);
  if (write) {
    fs.writeFileSync(file, table.serialize(result.rows));
  }
}

async function main() {
  console.log(`Mode: ${write ? 'write' : 'dry-run (pass --write to apply)'}`);

  console.log('Letterboxd:');
  // The live feed also lists films with no watch date; there is no export row
  // for those to become, so the refresh skips them.
  const entries = datedEntries(parseLetterboxdRss(await fetchText(LETTERBOXD_RSS)));
  console.log(`  feed: ${entries.length} diary entries`);
  const letterboxd = (file: string) => path.join(LETTERBOXD_DIR, file);
  refresh(letterboxd('diary.csv'), diaryTable, mergeDiary, entries, 'diary.csv');
  refresh(letterboxd('ratings.csv'), ratingsTable, mergeRatings, entries, 'ratings.csv');
  refresh(letterboxd('watched.csv'), watchedTable, mergeWatched, entries, 'watched.csv');
  refresh(letterboxd('reviews.csv'), reviewsTable, mergeReviews, entries, 'reviews.csv');

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
  refresh(GOODREADS_CSV, libraryTable, upsertGoodreads, books, 'library export');

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
