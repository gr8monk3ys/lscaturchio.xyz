/**
 * Letterboxd's two data formats — the account export CSVs committed under
 * `public/my-data/letterboxd/` and the public diary RSS feed — and nothing else.
 *
 * Every Letterboxd column name and feed tag is spelled here once. The site's
 * reader (`letterboxd.ts`) and the refresh script's merges (`media-refresh.ts`)
 * both work in the field names below, so the CSV seam between them cannot drift.
 * Pure: no filesystem, no network, no framework — the refresh script runs it
 * under plain `tsx`.
 */
import { defineCsvTable, type CsvRecord } from './csv';
import { rawTagValue, rssItems, tagValue, decodeEntities } from './rss-tags';

// ---------------------------------------------------------------------------
// Export CSVs
// ---------------------------------------------------------------------------

const COLUMNS = {
  date: 'Date',
  title: 'Name',
  year: 'Year',
  uri: 'Letterboxd URI',
  rating: 'Rating',
  rewatch: 'Rewatch',
  review: 'Review',
  tags: 'Tags',
  watchedDate: 'Watched Date',
} as const;

type Field = keyof typeof COLUMNS;

/** The column map for a table holding `fields`, in that (file) order. */
function columns<F extends Field>(...fields: F[]): Record<F, string> {
  const map = {} as Record<F, string>;
  for (const field of fields) map[field] = COLUMNS[field];
  return map;
}

/**
 * Note the URI namespaces: `ratings`, `watched` and `watchlist` hold the *film*
 * URI (`boxd.it/251c`), `diary` and `reviews` the URI of one *viewing*
 * (`boxd.it/8mdUF3`). Join across files with `filmKey`, never on `uri`.
 */
export const diaryTable = defineCsvTable(
  columns('date', 'title', 'year', 'uri', 'rating', 'rewatch', 'tags', 'watchedDate'),
);
export const ratingsTable = defineCsvTable(columns('date', 'title', 'year', 'uri', 'rating'));
export const watchedTable = defineCsvTable(columns('date', 'title', 'year', 'uri'));
export const watchlistTable = defineCsvTable(columns('date', 'title', 'year', 'uri'));
export const reviewsTable = defineCsvTable(
  columns('date', 'title', 'year', 'uri', 'rating', 'rewatch', 'review', 'tags', 'watchedDate'),
);
export const profileTable = defineCsvTable({
  dateJoined: 'Date Joined',
  username: 'Username',
  givenName: 'Given Name',
  familyName: 'Family Name',
  email: 'Email Address',
  location: 'Location',
  website: 'Website',
  bio: 'Bio',
  pronoun: 'Pronoun',
  /** Comma-separated film URIs, in pinned order. */
  favoriteFilms: 'Favorite Films',
});

export type DiaryRecord = CsvRecord<typeof diaryTable>;
export type RatingRecord = CsvRecord<typeof ratingsTable>;
export type WatchedRecord = CsvRecord<typeof watchedTable>;
export type WatchlistRecord = CsvRecord<typeof watchlistTable>;
export type ReviewRecord = CsvRecord<typeof reviewsTable>;
export type ProfileRecord = CsvRecord<typeof profileTable>;

/** The export's `Rewatch` cell: 'Yes', or empty. */
export const REWATCH_YES = 'Yes';

/**
 * Join key for a film across the export files and the feed.
 *
 * Letterboxd uses two different URI namespaces (see the tables above), so
 * joining on URI across files matches nothing at all. Title + year is the only
 * identifier common to every export.
 */
export function filmKey(title: string, year: string): string {
  return `${title.trim().toLowerCase()}|${year.trim()}`;
}

/**
 * The one rating rule, for the CSVs and the feed alike: Letterboxd ratings are
 * half-stars from 0.5 to 5.0. Anything else — empty, junk, out of range — is
 * no rating, so a malformed feed can't render as "999★" or be written to disk.
 */
export function parseRating(text: string): number | null {
  if (!text) return null;
  const rating = Number.parseFloat(text);
  return Number.isFinite(rating) && rating >= 0.5 && rating <= 5 ? rating : null;
}

// ---------------------------------------------------------------------------
// Diary RSS feed
// ---------------------------------------------------------------------------

export interface LetterboxdFeedEntry {
  title: string;
  year: string;
  link: string;
  /** The feed's own text (e.g. "4.0") when it passes `parseRating`; '' otherwise. */
  rating: string;
  /** YYYY-MM-DD, or null when the item carries no watch date. */
  watchedDate: string | null;
  rewatch: boolean;
  /** '' when there is no written review. */
  review: string;
}

/**
 * Strip HTML tags with a character scanner rather than a regex: keep text at
 * bracket depth zero, skip everything inside brackets, and drop stray
 * brackets. Unlike a `replace(/<[^>]*>/g, '')` pass — which leaves "<script>"
 * behind in "<scr<script>ipt>" (CodeQL js/incomplete-multi-character-
 * sanitization) — the output cannot contain an angle bracket at all. This
 * runs BEFORE entity decoding, so the member's own "&lt;3" is still escaped
 * here and unharmed — only malformed markup loses characters. The review
 * text is only ever rendered as React text content, but stored data should
 * not depend on every future consumer remembering that.
 */
function stripTags(html: string): string {
  let out = '';
  let depth = 0;
  for (const ch of html) {
    if (ch === '<') {
      depth++;
    } else if (ch === '>') {
      if (depth > 0) depth--;
    } else if (depth === 0) {
      out += ch;
    }
  }
  return out;
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

/**
 * Film entries from a Letterboxd RSS document, newest first. Items without a
 * film title (lists, other activity) are skipped. Entries without a watch date
 * are kept — whether they matter is the consumer's call.
 */
export function parseLetterboxdRss(xml: string): LetterboxdFeedEntry[] {
  const entries: LetterboxdFeedEntry[] = [];
  for (const item of rssItems(xml)) {
    const title = tagValue(item, 'letterboxd:filmTitle');
    if (!title) continue;
    const rating = tagValue(item, 'letterboxd:memberRating');
    entries.push({
      title,
      year: tagValue(item, 'letterboxd:filmYear'),
      link: tagValue(item, 'link'),
      rating: parseRating(rating) === null ? '' : rating,
      watchedDate: tagValue(item, 'letterboxd:watchedDate') || null,
      rewatch: tagValue(item, 'letterboxd:rewatch') === REWATCH_YES,
      review: extractReview(rawTagValue(item, 'description')),
    });
  }
  return entries;
}
