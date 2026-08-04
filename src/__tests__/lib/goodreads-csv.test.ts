import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import {
  getGoodreadsBooks,
  getCurrentlyReading,
  getReadBooks,
  getToReadBooks,
  getTopRatedBooks,
  getCustomShelves,
  getGoodreadsStats,
} from '@/lib/goodreads';

vi.mock('fs', () => ({
  default: { readFileSync: vi.fn() },
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

const mockReadFileSync = vi.mocked(fs.readFileSync);

const HEADER =
  'Book Id,Title,Author,ISBN,ISBN13,My Rating,Average Rating,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Exclusive Shelf,My Review';

// Goodreads wraps ISBNs as ="0141439512" so spreadsheets don't eat the leading
// zero; row 3 has the empty ="" form that a lot of older entries carry.
const LIBRARY_CSV = [
  HEADER,
  '1,Siddhartha,Hermann Hesse,="",="",5,3.98,152,2002,1922,2024/03/02,2024/01/05,books-that-changed-my-life,read,',
  '2,Brave New World,Aldous Huxley,="0060850523",="9780060850524",5,3.99,268,2006,1932,2024/06/10,2024/02/01,"books-for-existential-crises, rainy-day-reads",read,',
  '3,The Idiot,Fyodor Dostoevsky,="0140447920",="9780140447927",0,4.22,656,2004,1869,,2026/01/02,,currently-reading,',
  '4,Don Quixote,Miguel de Cervantes,="0060934344",="9780060934347",0,3.89,1023,2003,1605,,2026/01/03,,currently-reading,',
  '5,The Trial,Franz Kafka,="0805209999",="9780805209990",4,3.96,255,1999,1925,2023/11/01,2023/10/01,books-for-existential-crises,read,',
  '6,Ulysses,James Joyce,="0679722769",="9780679722762",0,3.75,783,1990,1922,,2026/02/01,,to-read,',
  '7,Gravity\'s Rainbow,Thomas Pynchon,="0143039946",="9780143039945",0,4.0,776,2006,1973,,2026/03/01,,to-read,',
  '8,,Nobody,="",="",0,0,0,,,,2026/02/02,,to-read,',
].join('\n');

beforeEach(() => {
  vi.clearAllMocks();
  mockReadFileSync.mockReturnValue(LIBRARY_CSV);
});

describe('getGoodreadsBooks', () => {
  it('parses titled rows and drops the untitled one', () => {
    expect(getGoodreadsBooks().map((b) => b.id)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('normalises a zero rating to null and builds the Goodreads link', () => {
    const [siddhartha, , idiot] = getGoodreadsBooks();

    expect(siddhartha.rating).toBe(5);
    expect(idiot.rating).toBeNull();
    expect(idiot.link).toBe('https://www.goodreads.com/book/show/3');
  });

  it('extracts a usable ISBN and reports null when the export has none', () => {
    const [siddhartha, brave] = getGoodreadsBooks();

    expect(siddhartha.isbn).toBeNull();
    expect(brave.isbn).toBe('9780060850524');
  });

  it('splits multi-value bookshelves', () => {
    const brave = getGoodreadsBooks().find((b) => b.title === 'Brave New World');
    expect(brave?.bookshelves).toEqual(['books-for-existential-crises', 'rainy-day-reads']);
  });

  it('returns an empty list when the CSV cannot be read', () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    expect(getGoodreadsBooks()).toEqual([]);
  });
});

describe('shelf queries', () => {
  it('returns the currently-reading shelf', () => {
    expect(getCurrentlyReading().map((b) => b.title)).toEqual(['The Idiot', 'Don Quixote']);
  });

  it('sorts finished books by date read, newest first', () => {
    expect(getReadBooks().map((b) => b.title)).toEqual([
      'Brave New World',
      'Siddhartha',
      'The Trial',
    ]);
  });

  it('sorts the to-read shelf by date added, newest first, and respects a limit', () => {
    expect(getToReadBooks().map((b) => b.title)).toEqual(["Gravity's Rainbow", 'Ulysses']);
    expect(getToReadBooks(1).map((b) => b.title)).toEqual(["Gravity's Rainbow"]);
  });

  it('returns only five-star books', () => {
    expect(getTopRatedBooks().map((b) => b.title)).toEqual(['Brave New World', 'Siddhartha']);
    expect(getTopRatedBooks(1)).toHaveLength(1);
  });
});

describe('getCustomShelves', () => {
  it('excludes the three exclusive shelves and sorts by size', () => {
    const shelves = getCustomShelves();

    expect(shelves.map((s) => s.name)).toEqual([
      'books-for-existential-crises',
      'books-that-changed-my-life',
      'rainy-day-reads',
    ]);
    expect(shelves.map((s) => s.name)).not.toContain('read');
    expect(shelves.map((s) => s.name)).not.toContain('to-read');
  });

  it('humanises the shelf slug for display', () => {
    const [largest] = getCustomShelves();
    expect(largest.label).toBe('Books for existential crises');
  });

  it('groups the right books under each shelf', () => {
    const existential = getCustomShelves().find(
      (s) => s.name === 'books-for-existential-crises',
    );
    expect(existential?.books.map((b) => b.title)).toEqual(['Brave New World', 'The Trial']);
  });

  it('returns an empty list when nothing is shelved', () => {
    mockReadFileSync.mockReturnValue([HEADER, '1,Solo,Someone,="",="",0,0,10,2000,2000,,,,to-read,'].join('\n'));
    expect(getCustomShelves()).toEqual([]);
  });
});

describe('getGoodreadsStats', () => {
  it('aggregates counts, pages, and the average of rated finished books', () => {
    expect(getGoodreadsStats()).toEqual({
      totalBooks: 7,
      booksRead: 3,
      currentlyReading: 2,
      toRead: 2,
      fiveStarBooks: 2,
      totalPages: 675, // 152 + 268 + 255
      averageRating: 4.67, // (5 + 5 + 4) / 3
    });
  });

  it('reports a zero average when nothing finished is rated', () => {
    mockReadFileSync.mockReturnValue(
      [HEADER, '1,Unrated,Someone,="",="",0,3.5,100,2000,2000,2024/01/01,2024/01/01,,read,'].join('\n'),
    );
    expect(getGoodreadsStats()).toMatchObject({ booksRead: 1, averageRating: 0 });
  });
});
