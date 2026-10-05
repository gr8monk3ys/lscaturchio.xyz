import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'fs';
import {
  createLetterboxdLibrary,
  getLetterboxdLibrary,
  type LetterboxdExports,
} from '@/lib/letterboxd';
import {
  diaryTable,
  profileTable,
  ratingsTable,
  reviewsTable,
  watchlistTable,
} from '@/lib/letterboxd-format';
import { logError } from '@/lib/logger';

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

// The diary dates below use the current year where the stats need "this
// year" entries — computed instead of hard-coded so the tests don't rot.
const YEAR = new Date().getFullYear();

const DIARY_CSV = [
  'Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date',
  `2020-01-05,Old Film,1999,https://boxd.it/old,3.5,,,2020-01-04`,
  `${YEAR}-02-11,"Comma, The Movie",2024,https://boxd.it/comma,5,Yes,,${YEAR}-02-10`,
  `${YEAR}-03-01,Unrated Film,2023,https://boxd.it/unrated,,,,${YEAR}-02-28`,
  `2021-06-06,,2001,https://boxd.it/notitle,4,,,2021-06-05`,
].join('\n');

const RATINGS_CSV = [
  'Date,Name,Year,Letterboxd URI,Rating',
  '2020-01-05,Old Film,1999,https://boxd.it/old,3.5',
  `${YEAR}-02-11,"Comma, The Movie",2024,https://boxd.it/comma,5`,
  '2022-08-09,Another Great One,2010,https://boxd.it/great,5',
  '2023-01-01,Never Scored,2015,https://boxd.it/none,',
].join('\n');

const WATCHLIST_CSV = [
  'Date,Name,Year,Letterboxd URI',
  '2024-05-05,Future Watch,2019,https://boxd.it/future',
  '2024-05-06,,2020,https://boxd.it/blank',
  '2024-05-07,Later Watch,2021,https://boxd.it/later',
].join('\n');

// Reviews are exported with the *entry* URI for one specific viewing, which is
// a different namespace from the *film* URIs in ratings.csv and the profile's
// favourites. Every URI here is deliberately unrelated to the ones above: if
// the join is ever keyed on URI again, these fixtures stop matching.
const REVIEWS_CSV = [
  'Date,Name,Year,Letterboxd URI,Rating,Rewatch,Review,Tags,Watched Date',
  '2022-08-10,Another Great One,2010,https://boxd.it/entry1,5,No,A tidy little film.,,2022-08-09',
  `${YEAR}-02-12,"Comma, The Movie",2024,https://boxd.it/entry2,5,Yes,"Two lines,\nand a comma.",,${YEAR}-02-10`,
  '2019-01-01,Old Film,1999,https://boxd.it/entry3,3.5,No,An earlier take.,,2019-01-01',
  '2021-01-01,Old Film,1999,https://boxd.it/entry4,3.5,No,The later take wins.,,2021-01-01',
  '2021-02-02,Old Film,1999,https://boxd.it/entry5,3.5,No,,,2021-02-02',
].join('\n');

const PROFILE_CSV = [
  'Date Joined,Username,Favorite Films',
  '2023-07-25,gr8monk3ys,"https://boxd.it/great, https://boxd.it/comma, https://boxd.it/missing"',
].join('\n');

const EXPORTS: LetterboxdExports = {
  diary: diaryTable.parse(DIARY_CSV),
  ratings: ratingsTable.parse(RATINGS_CSV),
  reviews: reviewsTable.parse(REVIEWS_CSV),
  watchlist: watchlistTable.parse(WATCHLIST_CSV),
  profile: profileTable.parse(PROFILE_CSV),
};

const library = (overrides: Partial<LetterboxdExports> = {}) =>
  createLetterboxdLibrary({ ...EXPORTS, ...overrides });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('recentWatches', () => {
  it('maps diary rows, newest watch first, dropping the untitled one', () => {
    const recent = library().recentWatches();

    expect(recent.map((m) => m.title)).toEqual(['Unrated Film', 'Comma, The Movie', 'Old Film']);
    expect(recent[1]).toEqual({
      title: 'Comma, The Movie',
      year: '2024',
      link: 'https://boxd.it/comma',
      rating: 5,
      dateWatched: `${YEAR}-02-10`,
      isRewatch: true,
      review: 'Two lines,\nand a comma.',
    });
  });

  it('leaves rating null for unrated entries and isRewatch false by default', () => {
    const [unrated] = library().recentWatches();
    expect(unrated).toMatchObject({ title: 'Unrated Film', rating: null, isRewatch: false });
    expect(unrated.review).toBeUndefined();
  });

  it('respects the limit and does not reorder the snapshot it reads from', () => {
    const lib = library();
    expect(lib.recentWatches(2)).toHaveLength(2);
    // A second query sees the same answer — the first one's sort did not leak.
    expect(lib.recentWatches(1)[0].title).toBe('Unrated Film');
  });
});

describe('stats', () => {
  it('aggregates totals, five-star count, this-year count, and average', () => {
    expect(library().stats()).toEqual({
      totalFilms: 3,
      totalRated: 3, // "Never Scored" has no rating
      fiveStarFilms: 2,
      thisYearFilms: 2, // the two diary entries watched this year
      averageRating: 4.5, // (3.5 + 5 + 5) / 3, rounded to 2 decimals
    });
  });

  it('reports a zero average when nothing is rated', () => {
    expect(library({ ratings: [] }).stats()).toMatchObject({ totalRated: 0, averageRating: 0 });
  });
});

describe('topRated', () => {
  it('returns only five-star films, most recently rated first', () => {
    expect(library().topRated().map((m) => m.title)).toEqual(['Comma, The Movie', 'Another Great One']);
    expect(library().topRated(1)).toHaveLength(1);
  });

  // Regression: reviews were originally joined on `Letterboxd URI`, which
  // silently matched nothing because ratings carry film URIs and reviews carry
  // per-viewing entry URIs. The join must use title + year.
  it('attaches reviews across the two URI namespaces', () => {
    const great = library().topRated().find((m) => m.title === 'Another Great One');
    expect(great).toMatchObject({ link: 'https://boxd.it/great', review: 'A tidy little film.' });
  });
});

describe('reviews', () => {
  it('keeps the most recently watched review when a film was rewatched', () => {
    const old = library().recentWatches().find((m) => m.title === 'Old Film');
    expect(old?.review).toBe('The later take wins.');
  });

  it('reviewed() returns one entry per reviewed film, newest first, with its rating', () => {
    const reviewed = library().reviewed();

    expect(reviewed.map((m) => m.title)).toEqual(['Comma, The Movie', 'Another Great One', 'Old Film']);
    expect(reviewed[0]).toMatchObject({ rating: 5, link: 'https://boxd.it/comma' });
    expect(library().reviewed(2)).toHaveLength(2);
  });

  it('reviewed() is empty when there are no reviews', () => {
    expect(library({ reviews: [] }).reviewed()).toEqual([]);
  });
});

describe('favorites', () => {
  it('resolves the profile favourites in pinned order, with rating and review', () => {
    const favorites = library().favorites();

    // "missing" resolves to nothing and is dropped rather than rendering blank.
    expect(favorites.map((m) => m.title)).toEqual(['Another Great One', 'Comma, The Movie']);
    expect(favorites[0]).toMatchObject({ rating: 5, review: 'A tidy little film.' });
  });

  it('is empty when the profile export is missing or pins nothing', () => {
    expect(library({ profile: [] }).favorites()).toEqual([]);
    expect(
      library({ profile: profileTable.parse('Date Joined,Username,Favorite Films\n2023-07-25,x,') }).favorites(),
    ).toEqual([]);
  });
});

describe('watchlist', () => {
  it('returns titled entries with no rating or watch date, in export order', () => {
    expect(library().watchlist()).toEqual([
      { title: 'Future Watch', year: '2019', link: 'https://boxd.it/future', rating: null, dateWatched: null, isRewatch: false },
      { title: 'Later Watch', year: '2021', link: 'https://boxd.it/later', rating: null, dateWatched: null, isRewatch: false },
    ]);
    expect(library().watchlist(1)).toHaveLength(1);
  });
});

describe('getLetterboxdLibrary', () => {
  it('reads the committed exports', () => {
    const lib = getLetterboxdLibrary();
    expect(lib.stats().totalFilms).toBeGreaterThan(0);
    expect(lib.favorites()).toHaveLength(4);
  });

  it('reads a missing export as empty and logs it', () => {
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(getLetterboxdLibrary().recentWatches()).toEqual([]);
    expect(logError).toHaveBeenCalledWith(
      'Error reading Letterboxd diary.csv',
      expect.any(Error),
      { module: 'letterboxd' },
    );
  });
});
