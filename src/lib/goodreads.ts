import fs from 'fs';
import path from 'path';
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

// Parse CSV with proper handling of quoted fields
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

// Get all books from local CSV data
export function getGoodreadsBooks(): GoodreadsBook[] {
  try {
    const csvPath = path.join(process.cwd(), 'public/my-data/goodreads/goodreads_library_export.csv');
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(csvText);

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

// Get books by custom shelf/tag
export function getBooksByTag(tag: string): GoodreadsBook[] {
  const books = getGoodreadsBooks();
  return books.filter(book => book.bookshelves.includes(tag));
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

// Get unique bookshelves/tags
export function getUniqueBookshelves(): string[] {
  const books = getGoodreadsBooks();
  const shelves = new Set<string>();
  books.forEach(book => {
    book.bookshelves.forEach(shelf => shelves.add(shelf));
  });
  return Array.from(shelves).sort();
}

// Legacy export for compatibility
export const GOODREADS_USERNAME = 'gr8monk3ys';
