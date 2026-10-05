import { describe, it, expect } from 'vitest';
import {
  datedEntries,
  mergeDiary,
  mergeRatings,
  mergeWatched,
  mergeReviews,
  upsertGoodreads,
  type DatedFeedEntry,
} from '@/lib/media-refresh';
import {
  diaryTable,
  ratingsTable,
  type DiaryRecord,
  type LetterboxdFeedEntry,
} from '@/lib/letterboxd-format';
import { libraryTable, type GoodreadsFeedEntry, type LibraryRecord } from '@/lib/goodreads-format';

const feedEntry = (overrides: Partial<LetterboxdFeedEntry>): LetterboxdFeedEntry => ({
  title: 'Untitled',
  year: '2026',
  link: 'https://letterboxd.com/gr8monk3ys/film/untitled/',
  rating: '',
  watchedDate: '2026-08-01',
  rewatch: false,
  review: '',
  ...overrides,
});

const ikiru = feedEntry({
  title: 'Ikiru',
  year: '1952',
  link: 'https://letterboxd.com/gr8monk3ys/film/ikiru/',
  rating: '5.0',
  watchedDate: '2026-08-01',
  rewatch: true,
  review: 'Still lands, harder now.',
});
const odyssey = feedEntry({
  title: 'The Odyssey',
  link: 'https://letterboxd.com/gr8monk3ys/film/the-odyssey-2026/',
  rating: '4.0',
  watchedDate: '2026-08-06',
});
const undated = feedEntry({ title: 'No Date', rating: '3.5', watchedDate: null, review: 'Words.' });

const entries = datedEntries([ikiru, odyssey, undated]);

describe('datedEntries', () => {
  it('keeps only entries with a watch date — there is no export row for the rest', () => {
    expect(entries.map((e) => e.title)).toEqual(['Ikiru', 'The Odyssey']);
  });
});

describe('Letterboxd merges', () => {
  const existingDiary: DiaryRecord[] = [
    {
      date: '2026-08-01',
      title: 'Ikiru',
      year: '1952',
      uri: 'https://boxd.it/x',
      rating: '5',
      rewatch: 'Yes',
      tags: '',
      watchedDate: '2026-08-01',
    },
  ];

  it('mergeDiary appends only unseen viewings (same film, new date = new row)', () => {
    const result = mergeDiary(existingDiary, entries);
    expect(result.added).toBe(1);
    expect(result.rows.at(-1)).toEqual({
      date: '2026-08-06',
      title: 'The Odyssey',
      year: '2026',
      uri: 'https://letterboxd.com/gr8monk3ys/film/the-odyssey-2026/',
      rating: '4.0',
      rewatch: '',
      tags: '',
      watchedDate: '2026-08-06',
    });

    // Idempotent: running the same merge again changes nothing.
    expect(mergeDiary(result.rows, entries).added).toBe(0);
  });

  it('mergeDiary writes the export’s "Yes" for a rewatch', () => {
    const result = mergeDiary([], entries);
    expect(diaryTable.serialize(result.rows).split('\n')[1]).toBe(
      '2026-08-01,Ikiru,1952,https://letterboxd.com/gr8monk3ys/film/ikiru/,5.0,Yes,,2026-08-01',
    );
  });

  it('mergeRatings appends new films and updates a changed rating in place', () => {
    const ratings = ratingsTable.parse(
      'Date,Name,Year,Letterboxd URI,Rating\n2025-01-07,Ikiru,1952,https://boxd.it/251c,4.5',
    );
    const result = mergeRatings(ratings, entries);
    expect(result.added).toBe(1); // The Odyssey
    expect(result.updated).toBe(1); // Ikiru 4.5 → 5.0
    expect(result.rows[0]).toMatchObject({ rating: '5.0', date: '2026-08-01' });
  });

  it('mergeRatings ignores unrated entries', () => {
    const unrated: DatedFeedEntry[] = [{ ...odyssey, rating: '', watchedDate: '2026-08-06' }];
    expect(mergeRatings([], unrated).added).toBe(0);
  });

  it('mergeWatched dedupes by film', () => {
    const watched = [{ date: '2025-01-07', title: 'Ikiru', year: '1952', uri: 'x' }];
    const result = mergeWatched(watched, entries);
    expect(result.added).toBe(1);
    expect(result.rows.map((r) => r.title)).toEqual(['Ikiru', 'The Odyssey']);
  });

  it('mergeReviews only appends entries with actual review text, once per viewing', () => {
    const result = mergeReviews([], entries);
    expect(result.added).toBe(1);
    expect(result.rows[0]).toMatchObject({
      title: 'Ikiru',
      review: 'Still lands, harder now.',
      rewatch: 'Yes',
    });
    expect(mergeReviews(result.rows, entries).added).toBe(0);
  });
});

describe('upsertGoodreads', () => {
  const iliad: GoodreadsFeedEntry = {
    bookId: '1371',
    title: 'The Iliad',
    author: 'Homer',
    isbn: '0140275363',
    rating: '5',
    averageRating: '3.88',
    pages: '614',
    published: '-750',
    readAt: '2026/08/04',
    dateAdded: '2023/08/01',
    shelves: 'books-that-changed-my-life',
    exclusiveShelf: 'read',
  };

  const existing = (): LibraryRecord => ({
    ...libraryTable.empty(),
    bookId: '1371',
    title: 'The Iliad',
    author: 'Homer',
    isbn: '="0140275363"',
    myRating: '0',
    exclusiveShelf: 'currently-reading',
    bookshelves: 'to-read',
    binding: 'Paperback', // export-only field must survive untouched
  });

  it('updates an existing row in place (shelf move, new rating) and counts it once', () => {
    const result = upsertGoodreads([existing()], [iliad]);
    expect(result.updated).toBe(1);
    expect(result.added).toBe(0);
    expect(result.rows[0]).toMatchObject({
      myRating: '5',
      exclusiveShelf: 'read',
      dateRead: '2026/08/04',
      binding: 'Paperback',
      // Stale exclusive-shelf leakage in Bookshelves gets cleared, not kept.
      bookshelves: 'books-that-changed-my-life',
    });
  });

  it('keeps an existing read date when the feed has none', () => {
    const row = { ...existing(), dateRead: '2020/01/01' };
    upsertGoodreads([row], [{ ...iliad, readAt: '' }]);
    expect(row.dateRead).toBe('2020/01/01');
  });

  it('appends unknown books with the export ISBN quoting and every other field empty', () => {
    const result = upsertGoodreads([], [iliad, { ...iliad, bookId: '2', isbn: '', exclusiveShelf: 'to-read' }]);
    expect(result.added).toBe(2);
    expect(result.rows[0]).toEqual({
      ...libraryTable.empty(),
      bookId: '1371',
      title: 'The Iliad',
      author: 'Homer',
      isbn: '="0140275363"',
      myRating: '5',
      averageRating: '3.88',
      pages: '614',
      originalPublicationYear: '-750',
      dateRead: '2026/08/04',
      dateAdded: '2023/08/01',
      bookshelves: 'books-that-changed-my-life',
      exclusiveShelf: 'read',
      readCount: '1',
    });
    expect(result.rows[1]).toMatchObject({ isbn: '=""', readCount: '0' });
  });

  it('is idempotent', () => {
    const first = upsertGoodreads([], [iliad]);
    const second = upsertGoodreads(first.rows, [iliad]);
    expect(second.added + second.updated).toBe(0);
  });
});
