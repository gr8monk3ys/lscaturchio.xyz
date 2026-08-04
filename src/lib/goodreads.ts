import fs from 'fs';
import path from 'path';
import { parseCsv } from './csv';
import { logError } from './logger';

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

// Goodreads exports ISBNs wrapped as ="9780374528379"; pull out a clean 10/13-digit value.
function cleanIsbn(raw13: string | undefined, raw10: string | undefined): string | null {
  for (const raw of [raw13, raw10]) {
    const v = (raw ?? '').replace(/[^0-9Xx]/g, '');
    if (v.length === 13 || v.length === 10) return v;
  }
  return null;
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


// Get all books from local CSV data
export function getGoodreadsBooks(): GoodreadsBook[] {
  try {
    const csvPath = path.join(process.cwd(), 'public/my-data/goodreads/goodreads_library_export.csv');
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCsv(csvText);

    return rows.map(row => {
      const bookId = row['Book Id'] || '';
      const rating = row['My Rating'] ? parseInt(row['My Rating'], 10) : null;
      const avgRating = row['Average Rating'] ? parseFloat(row['Average Rating']) : null;
      const bookshelves = row['Bookshelves'] ? row['Bookshelves'].split(',').map(s => s.trim()).filter(Boolean) : [];

      return {
        id: bookId,
        title: row['Title'] || '',
        author: row['Author'] || '',
        link: `https://www.goodreads.com/book/show/${bookId}`,
        rating: rating === 0 ? null : rating,
        averageRating: avgRating,
        dateRead: row['Date Read'] || null,
        dateAdded: row['Date Added'] || null,
        shelf: row['Exclusive Shelf'] || 'read',
        bookshelves,
        pages: row['Number of Pages'] ? parseInt(row['Number of Pages'], 10) : null,
        yearPublished: row['Original Publication Year'] ? parseInt(row['Original Publication Year'], 10) : null,
        isbn: cleanIsbn(row['ISBN13'], row['ISBN']),
      };
    }).filter(book => book.title);
  } catch (error) {
    logError('Error reading Goodreads data', error, { module: 'goodreads' });
    return [];
  }
}

// Get books by shelf
export function getBooksByShelf(shelf: string): GoodreadsBook[] {
  const books = getGoodreadsBooks();
  if (shelf === 'all') return books;
  return books.filter(book => book.shelf === shelf);
}

// Get currently reading books
export function getCurrentlyReading(): GoodreadsBook[] {
  return getBooksByShelf('currently-reading');
}

// Get read books sorted by date
export function getReadBooks(limit?: number): GoodreadsBook[] {
  const books = getBooksByShelf('read')
    .sort((a, b) => {
      if (!a.dateRead || !b.dateRead) return 0;
      return new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime();
    });
  return limit ? books.slice(0, limit) : books;
}

// Get to-read books
export function getToReadBooks(limit?: number): GoodreadsBook[] {
  const books = getBooksByShelf('to-read')
    .sort((a, b) => {
      if (!a.dateAdded || !b.dateAdded) return 0;
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });
  return limit ? books.slice(0, limit) : books;
}

export interface GoodreadsShelf {
  /** The raw Goodreads shelf slug, e.g. `books-that-changed-my-life`. */
  name: string;
  /** Human-readable form, e.g. `Books that changed my life`. */
  label: string;
  books: GoodreadsBook[];
}

// Goodreads models these three as "exclusive shelves" — they are reading state,
// not the hand-made shelves worth showing off.
const EXCLUSIVE_SHELVES = new Set(['read', 'currently-reading', 'to-read']);

function humanizeShelf(slug: string): string {
  const words = slug.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The shelves I made up myself, largest first. These are the ones that say
 * something — `books-that-changed-my-life` is a judgement, `read` is a checkbox.
 */
export function getCustomShelves(): GoodreadsShelf[] {
  const shelves = new Map<string, GoodreadsBook[]>();

  for (const book of getGoodreadsBooks()) {
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
    .map(([name, books]) => ({ name, label: humanizeShelf(name), books }))
    .sort((a, b) => b.books.length - a.books.length || a.name.localeCompare(b.name));
}

// Get top rated books (5 stars)
export function getTopRatedBooks(limit: number = 20): GoodreadsBook[] {
  const books = getGoodreadsBooks()
    .filter(book => book.rating === 5)
    .sort((a, b) => {
      if (!a.dateRead || !b.dateRead) return 0;
      return new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime();
    });
  return books.slice(0, limit);
}

// Calculate stats
export function getGoodreadsStats(): GoodreadsStats {
  const books = getGoodreadsBooks();
  const readBooks = books.filter(b => b.shelf === 'read');
  const ratedBooks = readBooks.filter(b => b.rating && b.rating > 0);

  const totalPages = readBooks.reduce((sum, b) => sum + (b.pages || 0), 0);
  const averageRating = ratedBooks.length > 0
    ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length
    : 0;

  return {
    totalBooks: books.length,
    booksRead: readBooks.length,
    currentlyReading: books.filter(b => b.shelf === 'currently-reading').length,
    toRead: books.filter(b => b.shelf === 'to-read').length,
    averageRating: Math.round(averageRating * 100) / 100,
    fiveStarBooks: books.filter(b => b.rating === 5).length,
    totalPages,
  };
}
