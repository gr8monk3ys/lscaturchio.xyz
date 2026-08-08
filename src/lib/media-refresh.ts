/**
 * Incremental refresh of the committed Letterboxd/Goodreads CSV exports from
 * each service's public RSS feed — no auth, no scraping beyond RSS.
 *
 * Feeds only carry recent history (Letterboxd: last ~50 diary entries;
 * Goodreads: last ~100 per shelf), so this keeps the exports *current* between
 * full manual exports; it cannot backfill a long gap. All merges key on
 * title+year (Letterboxd) or Book Id (Goodreads) — never on the export URIs,
 * which differ per file (see docs/repository-guide.md).
 */

export interface LetterboxdRssEntry {
  title: string;
  year: string;
  link: string;
  rating: string; // '' when unrated
  watchedDate: string; // YYYY-MM-DD
  rewatch: 'Yes' | 'No';
  review: string; // '' when no written review
}

export interface GoodreadsRssEntry {
  bookId: string;
  title: string;
  author: string;
  isbn: string; // '' when the feed has none
  rating: string; // '0' when unrated
  averageRating: string;
  pages: string;
  published: string;
  readAt: string; // YYYY/MM/DD or ''
  dateAdded: string; // YYYY/MM/DD
  shelves: string; // extra (non-exclusive) shelves, comma-separated
  exclusiveShelf: string; // read | currently-reading | to-read
}

function decodeEntities(text: string): string {
  // &amp; must decode LAST: doing it first turns "&amp;lt;" into "&lt;" and
  // then into "<" — a double-unescape (CodeQL js/double-escaping).
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Strip HTML tags, then drop any angle bracket that survives. A single
 * regex pass over "<scr<script>ipt>" leaves "<script>" behind (CodeQL
 * js/incomplete-multi-character-sanitization); repeating to a fixpoint and
 * then deleting stray brackets means no tag can exist in the output at all.
 * This runs BEFORE entity decoding, so the member's own "&lt;3" is still
 * escaped here and unharmed — only malformed markup loses characters. The
 * review text is only ever rendered as React text content, but stored data
 * should not depend on every future consumer remembering that.
 */
function stripTags(html: string): string {
  let previous = html;
  let current = html.replace(/<[^>]*>/g, '');
  while (current !== previous) {
    previous = current;
    current = current.replace(/<[^>]*>/g, '');
  }
  return current.replace(/[<>]/g, '');
}

/** CDATA-unwrapped raw value — no entity decoding (for HTML-bearing fields). */
function rawTagValue(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function tagValue(block: string, tag: string): string {
  return decodeEntities(rawTagValue(block, tag));
}

/** `Tue, 4 Aug 2026 00:00:00 +0000` → `2026/08/04` (Goodreads CSV date form). */
function toSlashDate(rfc822: string): string {
  if (!rfc822) return '';
  const d = new Date(rfc822);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}/${mm}/${dd}`;
}

/**
 * The review body in a Letterboxd RSS description: the first paragraph is the
 * poster image; any remaining paragraphs are the member's review text.
 * Letterboxd appends a spoiler notice paragraph for spoiler-flagged reviews.
 *
 * Operates on the RAW description and strips tags BEFORE decoding entities —
 * decoding first would double-unescape and let a member's literal "&lt;3"
 * be eaten as a tag.
 */
function extractReview(rawDescription: string): string {
  const paragraphs = Array.from(rawDescription.matchAll(/<p>([\s\S]*?)<\/p>/g))
    .map((m) => m[1])
    .filter((p) => !/<img\s/i.test(p))
    .map((p) => decodeEntities(stripTags(p)))
    .filter(Boolean)
    .filter((p) => !/^This review may contain spoilers/i.test(p))
    // Review-less diary entries carry a "Watched on <date>." filler paragraph.
    .filter((p) => !/^Watched on \w+ \w+ \d{1,2}, \d{4}\.?$/.test(p));
  return paragraphs.join('\n');
}

/** Diary entries (items carrying a filmTitle) from a Letterboxd RSS document. */
export function parseLetterboxdRss(xml: string): LetterboxdRssEntry[] {
  return xml
    .split('<item>')
    .slice(1)
    .map((item) => {
      const title = tagValue(item, 'letterboxd:filmTitle');
      if (!title) return null; // lists and other non-diary items
      return {
        title,
        year: tagValue(item, 'letterboxd:filmYear'),
        link: tagValue(item, 'link'),
        rating: tagValue(item, 'letterboxd:memberRating'),
        watchedDate: tagValue(item, 'letterboxd:watchedDate'),
        rewatch: tagValue(item, 'letterboxd:rewatch') === 'Yes' ? ('Yes' as const) : ('No' as const),
        review: extractReview(rawTagValue(item, 'description')),
      };
    })
    .filter((e): e is LetterboxdRssEntry => e !== null && Boolean(e.watchedDate));
}

/** Shelf items from a Goodreads review-list RSS document. */
export function parseGoodreadsRss(xml: string, exclusiveShelf: string): GoodreadsRssEntry[] {
  return xml
    .split('<item>')
    .slice(1)
    .map((item) => ({
      bookId: tagValue(item, 'book_id'),
      title: tagValue(item, 'title'),
      author: tagValue(item, 'author_name'),
      isbn: tagValue(item, 'isbn'),
      rating: tagValue(item, 'user_rating') || '0',
      averageRating: tagValue(item, 'average_rating'),
      pages: tagValue(item, 'num_pages'),
      published: tagValue(item, 'book_published'),
      readAt: toSlashDate(tagValue(item, 'user_read_at')),
      dateAdded: toSlashDate(tagValue(item, 'user_date_added')),
      shelves: tagValue(item, 'user_shelves'),
      exclusiveShelf,
    }))
    .filter((e) => e.bookId && e.title);
}

export interface MergeResult<T> {
  rows: T[];
  added: number;
  updated: number;
}

type Row = Record<string, string>;

const filmKey = (name: string, year: string) => `${name.trim().toLowerCase()}|${year.trim()}`;

/** diary.csv: append entries not already present (a rewatch is a new row). */
export function mergeDiary(rows: Row[], entries: LetterboxdRssEntry[]): MergeResult<Row> {
  const seen = new Set(rows.map((r) => `${filmKey(r['Name'], r['Year'])}|${r['Watched Date']}`));
  let added = 0;
  const out = [...rows];
  for (const e of entries) {
    const key = `${filmKey(e.title, e.year)}|${e.watchedDate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      Date: e.watchedDate,
      Name: e.title,
      Year: e.year,
      'Letterboxd URI': e.link,
      Rating: e.rating,
      Rewatch: e.rewatch === 'Yes' ? 'Yes' : '',
      Tags: '',
      'Watched Date': e.watchedDate,
    });
    added++;
  }
  return { rows: out, added, updated: 0 };
}

/** ratings.csv: one row per film — append new films, update changed ratings. */
export function mergeRatings(rows: Row[], entries: LetterboxdRssEntry[]): MergeResult<Row> {
  const byKey = new Map(rows.map((r) => [filmKey(r['Name'], r['Year']), r]));
  let added = 0;
  let updated = 0;
  const out = [...rows];
  for (const e of entries) {
    if (!e.rating) continue;
    const existing = byKey.get(filmKey(e.title, e.year));
    if (existing) {
      if (existing['Rating'] !== e.rating) {
        existing['Rating'] = e.rating;
        existing['Date'] = e.watchedDate;
        updated++;
      }
      continue;
    }
    const row: Row = {
      Date: e.watchedDate,
      Name: e.title,
      Year: e.year,
      'Letterboxd URI': e.link,
      Rating: e.rating,
    };
    byKey.set(filmKey(e.title, e.year), row);
    out.push(row);
    added++;
  }
  return { rows: out, added, updated };
}

/** watched.csv: one row per film ever watched. */
export function mergeWatched(rows: Row[], entries: LetterboxdRssEntry[]): MergeResult<Row> {
  const seen = new Set(rows.map((r) => filmKey(r['Name'], r['Year'])));
  let added = 0;
  const out = [...rows];
  for (const e of entries) {
    const key = filmKey(e.title, e.year);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ Date: e.watchedDate, Name: e.title, Year: e.year, 'Letterboxd URI': e.link });
    added++;
  }
  return { rows: out, added, updated: 0 };
}

/** reviews.csv: append written reviews not already recorded for that viewing. */
export function mergeReviews(rows: Row[], entries: LetterboxdRssEntry[]): MergeResult<Row> {
  const seen = new Set(rows.map((r) => `${filmKey(r['Name'], r['Year'])}|${r['Watched Date']}`));
  let added = 0;
  const out = [...rows];
  for (const e of entries) {
    if (!e.review) continue;
    const key = `${filmKey(e.title, e.year)}|${e.watchedDate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      Date: e.watchedDate,
      Name: e.title,
      Year: e.year,
      'Letterboxd URI': e.link,
      Rating: e.rating,
      Rewatch: e.rewatch === 'Yes' ? 'Yes' : '',
      Review: e.review,
      Tags: '',
      'Watched Date': e.watchedDate,
    });
    added++;
  }
  return { rows: out, added, updated: 0 };
}

/**
 * goodreads_library_export.csv: upsert by Book Id. Existing rows keep their
 * export-only columns (ISBN forms, binding, publisher…) and receive the fields
 * the RSS knows better: rating, read date, shelves. New rows carry every field
 * the feed provides; export-only columns stay empty until the next full export.
 */
export function upsertGoodreads(rows: Row[], entries: GoodreadsRssEntry[]): MergeResult<Row> {
  const byId = new Map(rows.map((r) => [r['Book Id'], r]));
  let added = 0;
  let updated = 0;
  const out = [...rows];
  for (const e of entries) {
    const existing = byId.get(e.bookId);
    if (existing) {
      let changed = false;
      const updates: Array<[string, string]> = [
        ['My Rating', e.rating],
        ['Exclusive Shelf', e.exclusiveShelf],
        // Always overwrite: Goodreads exports leak the exclusive shelf into
        // Bookshelves ("to-read" stays behind after a book is finished), and
        // the feed's user_shelves — custom shelves only — is the clean truth.
        ['Bookshelves', e.shelves],
      ];
      if (e.readAt) updates.push(['Date Read', e.readAt]);
      for (const [col, value] of updates) {
        if (existing[col] !== value) {
          existing[col] = value;
          changed = true;
        }
      }
      if (changed) updated++;
      continue;
    }
    const row: Row = {
      'Book Id': e.bookId,
      Title: e.title,
      Author: e.author,
      ISBN: e.isbn ? `="${e.isbn}"` : '=""',
      'My Rating': e.rating,
      'Average Rating': e.averageRating,
      'Number of Pages': e.pages,
      'Original Publication Year': e.published,
      'Date Read': e.readAt,
      'Date Added': e.dateAdded,
      Bookshelves: e.shelves,
      'Exclusive Shelf': e.exclusiveShelf,
      'Read Count': e.exclusiveShelf === 'read' ? '1' : '0',
    };
    byId.set(e.bookId, row);
    out.push(row);
    added++;
  }
  return { rows: out, added, updated };
}
