/**
 * Goodreads' two data formats — the library export CSV committed at
 * `public/my-data/goodreads/goodreads_library_export.csv` and the public
 * per-shelf RSS feed — and nothing else.
 *
 * Every Goodreads column name and feed tag is spelled here once. The site's
 * reader (`goodreads.ts`) and the refresh script's upsert (`media-refresh.ts`)
 * both work in the field names below. Pure: no filesystem, no network, no
 * framework — the refresh script runs it under plain `tsx`.
 */
import { defineCsvTable, type CsvRecord } from './csv';
import { rssItems, tagValue } from './rss-tags';

// ---------------------------------------------------------------------------
// Library export CSV
// ---------------------------------------------------------------------------

export const libraryTable = defineCsvTable({
  bookId: 'Book Id',
  title: 'Title',
  author: 'Author',
  authorLastFirst: 'Author l-f',
  additionalAuthors: 'Additional Authors',
  /** Wrapped as `="0141439512"` so spreadsheets keep the leading zero; `=""` when absent. */
  isbn: 'ISBN',
  isbn13: 'ISBN13',
  /** '0' when unrated. */
  myRating: 'My Rating',
  averageRating: 'Average Rating',
  publisher: 'Publisher',
  binding: 'Binding',
  pages: 'Number of Pages',
  yearPublished: 'Year Published',
  originalPublicationYear: 'Original Publication Year',
  /** YYYY/MM/DD, or ''. */
  dateRead: 'Date Read',
  /** YYYY/MM/DD. */
  dateAdded: 'Date Added',
  /** Custom shelves, comma-separated. */
  bookshelves: 'Bookshelves',
  bookshelvesWithPositions: 'Bookshelves with positions',
  /** read | currently-reading | to-read */
  exclusiveShelf: 'Exclusive Shelf',
  myReview: 'My Review',
  spoiler: 'Spoiler',
  privateNotes: 'Private Notes',
  readCount: 'Read Count',
  ownedCopies: 'Owned Copies',
});

export type LibraryRecord = CsvRecord<typeof libraryTable>;

/** The export's ISBN cell form for a bare ISBN (or none). */
export function exportIsbn(isbn: string): string {
  return `="${isbn}"`;
}

// ---------------------------------------------------------------------------
// Shelf RSS feed
// ---------------------------------------------------------------------------

export interface GoodreadsFeedEntry {
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

/** `Tue, 4 Aug 2026 00:00:00 +0000` → `2026/08/04` (the export's date form). */
function toSlashDate(rfc822: string): string {
  if (!rfc822) return '';
  const d = new Date(rfc822);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}/${mm}/${dd}`;
}

/** Shelf items from a Goodreads review-list RSS document. */
export function parseGoodreadsRss(xml: string, exclusiveShelf: string): GoodreadsFeedEntry[] {
  return rssItems(xml)
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
