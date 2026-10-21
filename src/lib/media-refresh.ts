/**
 * Incremental refresh of the committed Letterboxd/Goodreads CSV exports from
 * each service's public RSS feed — no auth, no scraping beyond RSS.
 *
 * Feeds only carry recent history (Letterboxd: last ~50 diary entries;
 * Goodreads: last ~100 per shelf), so this keeps the exports *current* between
 * full manual exports; it cannot backfill a long gap. All merges key on
 * title+year (Letterboxd) or Book Id (Goodreads) — never on the export URIs,
 * which differ per file (see docs/repository-guide.md).
 *
 * This module is merge policy only. Reading and writing the CSVs and parsing
 * the feeds belong to `letterboxd-format.ts` and `goodreads-format.ts`; the
 * merges here see field-named records, never column names.
 */
import {
  filmKey,
  REWATCH_YES,
  type DiaryRecord,
  type LetterboxdFeedEntry,
  type RatingRecord,
  type ReviewRecord,
  type WatchedRecord,
} from './letterboxd-format';
import {
  exportIsbn,
  libraryTable,
  type GoodreadsFeedEntry,
  type LibraryRecord,
} from './goodreads-format';

export interface MergeResult<T> {
  rows: T[];
  added: number;
  updated: number;
}

/** A feed entry that can be written: every export row is keyed by its watch date. */
export type DatedFeedEntry = LetterboxdFeedEntry & { watchedDate: string };

/**
 * The feed entries the merges accept. An entry without a watch date has no
 * diary row to become, and the refresh has always skipped it for every file.
 */
export function datedEntries(entries: LetterboxdFeedEntry[]): DatedFeedEntry[] {
  return entries.filter((e): e is DatedFeedEntry => Boolean(e.watchedDate));
}

const viewingKey = (title: string, year: string, watchedDate: string) =>
  `${filmKey(title, year)}|${watchedDate}`;

/** diary.csv: append entries not already present (a rewatch is a new row). */
export function mergeDiary(rows: DiaryRecord[], entries: DatedFeedEntry[]): MergeResult<DiaryRecord> {
  const seen = new Set(rows.map((r) => viewingKey(r.title, r.year, r.watchedDate)));
  let added = 0;
  const out = [...rows];
  for (const e of entries) {
    const key = viewingKey(e.title, e.year, e.watchedDate);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      date: e.watchedDate,
      title: e.title,
      year: e.year,
      uri: e.link,
      rating: e.rating,
      rewatch: e.rewatch ? REWATCH_YES : '',
      tags: '',
      watchedDate: e.watchedDate,
    });
    added++;
  }
  return { rows: out, added, updated: 0 };
}

/** ratings.csv: one row per film — append new films, update changed ratings. */
export function mergeRatings(rows: RatingRecord[], entries: DatedFeedEntry[]): MergeResult<RatingRecord> {
  const byKey = new Map(rows.map((r) => [filmKey(r.title, r.year), r]));
  let added = 0;
  let updated = 0;
  const out = [...rows];
  for (const e of entries) {
    if (!e.rating) continue;
    const existing = byKey.get(filmKey(e.title, e.year));
    if (existing) {
      if (existing.rating !== e.rating) {
        existing.rating = e.rating;
        existing.date = e.watchedDate;
        updated++;
      }
      continue;
    }
    const row: RatingRecord = {
      date: e.watchedDate,
      title: e.title,
      year: e.year,
      uri: e.link,
      rating: e.rating,
    };
    byKey.set(filmKey(e.title, e.year), row);
    out.push(row);
    added++;
  }
  return { rows: out, added, updated };
}

/** watched.csv: one row per film ever watched. */
export function mergeWatched(rows: WatchedRecord[], entries: DatedFeedEntry[]): MergeResult<WatchedRecord> {
  const seen = new Set(rows.map((r) => filmKey(r.title, r.year)));
  let added = 0;
  const out = [...rows];
  for (const e of entries) {
    const key = filmKey(e.title, e.year);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ date: e.watchedDate, title: e.title, year: e.year, uri: e.link });
    added++;
  }
  return { rows: out, added, updated: 0 };
}

/** reviews.csv: append written reviews not already recorded for that viewing. */
export function mergeReviews(rows: ReviewRecord[], entries: DatedFeedEntry[]): MergeResult<ReviewRecord> {
  const seen = new Set(rows.map((r) => viewingKey(r.title, r.year, r.watchedDate)));
  let added = 0;
  const out = [...rows];
  for (const e of entries) {
    if (!e.review) continue;
    const key = viewingKey(e.title, e.year, e.watchedDate);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      date: e.watchedDate,
      title: e.title,
      year: e.year,
      uri: e.link,
      rating: e.rating,
      rewatch: e.rewatch ? REWATCH_YES : '',
      review: e.review,
      tags: '',
      watchedDate: e.watchedDate,
    });
    added++;
  }
  return { rows: out, added, updated: 0 };
}

/**
 * goodreads_library_export.csv: upsert by Book Id. Existing rows keep their
 * export-only fields (ISBN forms, binding, publisher…) and receive the fields
 * the RSS knows better: rating, read date, shelves. New rows carry every field
 * the feed provides; export-only fields stay empty until the next full export.
 */
export function upsertGoodreads(rows: LibraryRecord[], entries: GoodreadsFeedEntry[]): MergeResult<LibraryRecord> {
  const byId = new Map(rows.map((r) => [r.bookId, r]));
  let added = 0;
  let updated = 0;
  const out = [...rows];
  for (const e of entries) {
    const existing = byId.get(e.bookId);
    if (existing) {
      let changed = false;
      const updates: Array<[keyof LibraryRecord, string]> = [
        ['myRating', e.rating],
        ['exclusiveShelf', e.exclusiveShelf],
        // Always overwrite: Goodreads exports leak the exclusive shelf into
        // Bookshelves ("to-read" stays behind after a book is finished), and
        // the feed's user_shelves — custom shelves only — is the clean truth.
        ['bookshelves', e.shelves],
      ];
      if (e.readAt) updates.push(['dateRead', e.readAt]);
      for (const [field, value] of updates) {
        if (existing[field] !== value) {
          existing[field] = value;
          changed = true;
        }
      }
      if (changed) updated++;
      continue;
    }
    const row: LibraryRecord = {
      ...libraryTable.empty(),
      bookId: e.bookId,
      title: e.title,
      author: e.author,
      isbn: exportIsbn(e.isbn),
      myRating: e.rating,
      averageRating: e.averageRating,
      pages: e.pages,
      originalPublicationYear: e.published,
      dateRead: e.readAt,
      dateAdded: e.dateAdded,
      bookshelves: e.shelves,
      exclusiveShelf: e.exclusiveShelf,
      readCount: e.exclusiveShelf === 'read' ? '1' : '0',
    };
    byId.set(e.bookId, row);
    out.push(row);
    added++;
  }
  return { rows: out, added, updated };
}
