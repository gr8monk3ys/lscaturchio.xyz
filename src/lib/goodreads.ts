import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { logError } from './logger';
import { libraryTable, type LibraryRecord } from './goodreads-format';

export interface GoodreadsBook {
  id: string;
  title: string;
  author: string;
  link: string;
  rating: number | null;
  averageRating: number | null;
  dateRead: string | null;
  dateAdded: string | null;
  shelf: string;
  bookshelves: string[];
  pages: number | null;
  yearPublished: number | null;
  isbn: string | null;
}

export interface GoodreadsStats {
  totalBooks: number;
  booksRead: number;
  currentlyReading: number;
  toRead: number;
  averageRating: number;
  fiveStarBooks: number;
  totalPages: number;
}

export interface GoodreadsShelf {
  /** The raw Goodreads shelf slug, e.g. `books-that-changed-my-life`. */
  name: string;
  /** Human-readable form, e.g. `Books that changed my life`. */
  label: string;
  books: GoodreadsBook[];
}

/** One read of the Goodreads export, queried by the pages. */
export interface GoodreadsLibrary {
  stats(): GoodreadsStats;
  currentlyReading(): GoodreadsBook[];
  /** Finished books, most recently read first. */
  read(limit?: number): GoodreadsBook[];
  /** The queue, most recently added first. */
  toRead(limit?: number): GoodreadsBook[];
  /** Five-star FINISHED books — a mid-read rating doesn't count yet. */
  topRated(limit?: number): GoodreadsBook[];
  /** The shelves I made up myself, largest first. */
  customShelves(): GoodreadsShelf[];
}

// Goodreads exports ISBNs wrapped as ="9780374528379"; pull out a clean 10/13-digit value.
function cleanIsbn(raw13: string, raw10: string): string | null {
  for (const raw of [raw13, raw10]) {
    const v = raw.replace(/[^0-9Xx]/g, '');
    if (v.length === 13 || v.length === 10) return v;
  }
  return null;
}

function toBook(row: LibraryRecord): GoodreadsBook {
  const rating = row.myRating ? parseInt(row.myRating, 10) : null;

  return {
    id: row.bookId,
    title: row.title,
    author: row.author,
    link: `https://www.goodreads.com/book/show/${row.bookId}`,
    rating: rating === 0 ? null : rating,
    averageRating: row.averageRating ? parseFloat(row.averageRating) : null,
    dateRead: row.dateRead || null,
    dateAdded: row.dateAdded || null,
    shelf: row.exclusiveShelf || 'read',
    bookshelves: row.bookshelves
      ? row.bookshelves.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    pages: row.pages ? parseInt(row.pages, 10) : null,
    yearPublished: row.originalPublicationYear ? parseInt(row.originalPublicationYear, 10) : null,
    isbn: cleanIsbn(row.isbn13, row.isbn),
  };
}

// Goodreads models these three as "exclusive shelves" — they are reading state,
// not the hand-made shelves worth showing off.
const EXCLUSIVE_SHELVES = new Set(['read', 'currently-reading', 'to-read']);

function humanizeShelf(slug: string): string {
  const words = slug.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Newest first by a Goodreads date; a pair with either date missing keeps its order. */
function newestFirst(date: (book: GoodreadsBook) => string | null) {
  return (a: GoodreadsBook, b: GoodreadsBook) => {
    const da = date(a);
    const db = date(b);
    if (!da || !db) return 0;
    return new Date(db).getTime() - new Date(da).getTime();
  };
}

const take = <T>(items: T[], limit?: number) => (limit ? items.slice(0, limit) : items.slice());

/** Build the library from parsed export records. Pure — tests start here. */
export function createGoodreadsLibrary(rows: LibraryRecord[]): GoodreadsLibrary {
  const books = rows.map(toBook).filter((book) => book.title);
  const onShelf = (shelf: string) => books.filter((book) => book.shelf === shelf);

  return {
    stats() {
      const readBooks = onShelf('read');
      const ratedBooks = readBooks.filter((b) => b.rating && b.rating > 0);
      const averageRating =
        ratedBooks.length > 0
          ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length
          : 0;

      return {
        totalBooks: books.length,
        booksRead: readBooks.length,
        currentlyReading: onShelf('currently-reading').length,
        toRead: onShelf('to-read').length,
        averageRating: Math.round(averageRating * 100) / 100,
        fiveStarBooks: books.filter((b) => b.rating === 5).length,
        totalPages: readBooks.reduce((sum, b) => sum + (b.pages || 0), 0),
      };
    },

    currentlyReading() {
      return onShelf('currently-reading');
    },

    read(limit) {
      return take(onShelf('read').sort(newestFirst((b) => b.dateRead)), limit);
    },

    toRead(limit) {
      return take(onShelf('to-read').sort(newestFirst((b) => b.dateAdded)), limit);
    },

    topRated(limit = 20) {
      return books
        .filter((book) => book.rating === 5 && book.shelf === 'read')
        .sort(newestFirst((b) => b.dateRead))
        .slice(0, limit);
    },

    customShelves() {
      // These are the ones that say something — `books-that-changed-my-life`
      // is a judgement, `read` is a checkbox.
      const shelves = new Map<string, GoodreadsBook[]>();
      for (const book of books) {
        for (const shelf of book.bookshelves) {
          if (EXCLUSIVE_SHELVES.has(shelf)) continue;
          const existing = shelves.get(shelf);
          if (existing) {
            existing.push(book);
          } else {
            shelves.set(shelf, [book]);
          }
        }
      }

      return Array.from(shelves.entries())
        .map(([name, shelved]) => ({ name, label: humanizeShelf(name), books: shelved }))
        .sort((a, b) => b.books.length - a.books.length || a.name.localeCompare(b.name));
    },
  };
}

/**
 * The Goodreads library for this render. `cache` scopes it to one server
 * request, so `/books` — metadata plus six queries — reads and parses the
 * export once, and the next request (or ISR revalidation) reads it afresh,
 * exactly as before.
 */
export const getGoodreadsLibrary = cache((): GoodreadsLibrary => {
  try {
    const csvPath = path.join(process.cwd(), 'public/my-data/goodreads/goodreads_library_export.csv');
    return createGoodreadsLibrary(libraryTable.parse(fs.readFileSync(csvPath, 'utf-8')));
  } catch (error) {
    logError('Error reading Goodreads data', error, { module: 'goodreads' });
    return createGoodreadsLibrary([]);
  }
});
