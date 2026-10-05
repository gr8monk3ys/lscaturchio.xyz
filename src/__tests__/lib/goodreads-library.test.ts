import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'fs';
import { createGoodreadsLibrary, getGoodreadsLibrary } from '@/lib/goodreads';
import { libraryTable } from '@/lib/goodreads-format';
import { logError } from '@/lib/logger';

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

const HEADER =
  'Book Id,Title,Author,ISBN,ISBN13,My Rating,Average Rating,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Exclusive Shelf,My Review';

// Goodreads wraps ISBNs as ="0141439512" so spreadsheets don't eat the leading
// zero; row 1 has the empty ="" form that a lot of older entries carry.
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
  // rated 5 mid-read: must NOT count as a top-rated (finished) book
  '9,Rated Mid Read,Someone,="",="",5,4.0,300,2000,2000,,2026/07/01,,currently-reading,',
].join('\n');

const library = (csv = LIBRARY_CSV) => createGoodreadsLibrary(libraryTable.parse(csv));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('book mapping', () => {
  it('maps a row to a book, normalising a zero rating and building the link', () => {
    const [idiot] = library().currentlyReading();

    expect(idiot).toEqual({
      id: '3',
      title: 'The Idiot',
      author: 'Fyodor Dostoevsky',
      link: 'https://www.goodreads.com/book/show/3',
      rating: null,
      averageRating: 4.22,
      dateRead: null,
      dateAdded: '2026/01/02',
      shelf: 'currently-reading',
      bookshelves: [],
      pages: 656,
      yearPublished: 1869,
      isbn: '9780140447927',
    });
  });

  it('reports a null ISBN when the export has none, and splits multi-value shelves', () => {
    const [brave, siddhartha] = library().read();

    expect(siddhartha.isbn).toBeNull();
    expect(brave.bookshelves).toEqual(['books-for-existential-crises', 'rainy-day-reads']);
  });
});

describe('shelf queries', () => {
  it('returns the currently-reading shelf in export order', () => {
    expect(library().currentlyReading().map((b) => b.title)).toEqual([
      'The Idiot',
      'Don Quixote',
      'Rated Mid Read',
    ]);
  });

  it('sorts finished books by date read, newest first', () => {
    expect(library().read().map((b) => b.title)).toEqual(['Brave New World', 'Siddhartha', 'The Trial']);
    expect(library().read(1)).toHaveLength(1);
  });

  it('sorts the to-read shelf by date added, newest first, dropping the untitled row', () => {
    expect(library().toRead().map((b) => b.title)).toEqual(["Gravity's Rainbow", 'Ulysses']);
    expect(library().toRead(1).map((b) => b.title)).toEqual(["Gravity's Rainbow"]);
  });

  it('returns only five-star FINISHED books — a mid-read rating does not count', () => {
    expect(library().topRated().map((b) => b.title)).toEqual(['Brave New World', 'Siddhartha']);
    expect(library().topRated(1)).toHaveLength(1);
  });
});

describe('customShelves', () => {
  it('excludes the three exclusive shelves, sorts by size, and humanises the slug', () => {
    const shelves = library().customShelves();

    expect(shelves.map((s) => s.name)).toEqual([
      'books-for-existential-crises',
      'books-that-changed-my-life',
      'rainy-day-reads',
    ]);
    expect(shelves[0].label).toBe('Books for existential crises');
    expect(shelves[0].books.map((b) => b.title)).toEqual(['Brave New World', 'The Trial']);
  });

  it('returns an empty list when nothing is shelved', () => {
    expect(library([HEADER, '1,Solo,Someone,="",="",0,0,10,2000,2000,,,,to-read,'].join('\n')).customShelves()).toEqual([]);
  });
});

describe('stats', () => {
  it('aggregates counts, pages, and the average of rated finished books', () => {
    expect(library().stats()).toEqual({
      totalBooks: 8,
      booksRead: 3,
      currentlyReading: 3,
      toRead: 2,
      fiveStarBooks: 3,
      totalPages: 675, // 152 + 268 + 255
      averageRating: 4.67, // (5 + 5 + 4) / 3
    });
  });

  it('reports a zero average when nothing finished is rated', () => {
    const csv = [HEADER, '1,Unrated,Someone,="",="",0,3.5,100,2000,2000,2024/01/01,2024/01/01,,read,'].join('\n');
    expect(library(csv).stats()).toMatchObject({ booksRead: 1, averageRating: 0 });
  });
});

describe('getGoodreadsLibrary', () => {
  it('reads the committed export', () => {
    expect(getGoodreadsLibrary().stats().totalBooks).toBeGreaterThan(0);
  });

  it('is empty, and logs, when the export cannot be read', () => {
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(getGoodreadsLibrary().stats().totalBooks).toBe(0);
    expect(logError).toHaveBeenCalledWith('Error reading Goodreads data', expect.any(Error), {
      module: 'goodreads',
    });
  });
});
