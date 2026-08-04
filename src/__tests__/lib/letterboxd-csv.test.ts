import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import {
  getLetterboxdMovies,
  getLetterboxdRatings,
  getLetterboxdWatchlist,
  getLetterboxdStats,
  getTopRatedMovies,
  getRecentWatches,
  getFavoriteFilms,
  getReviewedFilms,
} from '@/lib/letterboxd';

vi.mock('fs', () => ({
  default: { readFileSync: vi.fn() },
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

const mockReadFileSync = vi.mocked(fs.readFileSync);

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
].join('\n');

const PROFILE_CSV = [
  'Date Joined,Username,Given Name,Favorite Films',
  '2023-07-25,gr8monk3ys,Lorenzo,"https://boxd.it/great, https://boxd.it/comma, https://boxd.it/missing"',
].join('\n');

function serveCsvFixtures() {
  mockReadFileSync.mockImplementation((filePath) => {
    const p = String(filePath);
    if (p.includes('diary.csv')) return DIARY_CSV;
    if (p.includes('ratings.csv')) return RATINGS_CSV;
    if (p.includes('watchlist.csv')) return WATCHLIST_CSV;
    if (p.includes('reviews.csv')) return REVIEWS_CSV;
    if (p.includes('profile.csv')) return PROFILE_CSV;
    throw new Error(`ENOENT: ${p}`);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  serveCsvFixtures();
});

describe('getLetterboxdMovies', () => {
  it('parses diary rows including quoted titles with commas', () => {
    const movies = getLetterboxdMovies();

    expect(movies).toHaveLength(3); // the row without a Name is dropped
    expect(movies[1]).toEqual({
      title: 'Comma, The Movie',
      year: '2024',
      link: 'https://boxd.it/comma',
      rating: 5,
      dateWatched: `${YEAR}-02-10`,
      isRewatch: true,
    });
  });

  it('leaves rating null for unrated entries and isRewatch false by default', () => {
    const movies = getLetterboxdMovies();
    expect(movies[2]).toMatchObject({ title: 'Unrated Film', rating: null, isRewatch: false });
    expect(movies[0]).toMatchObject({ title: 'Old Film', isRewatch: false });
  });

  it('returns an empty list when the CSV cannot be read', () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    expect(getLetterboxdMovies()).toEqual([]);
  });
});

describe('getLetterboxdRatings', () => {
  it('returns only rated films, reading the date from the Date column', () => {
    const rated = getLetterboxdRatings();

    expect(rated.map((m) => m.title)).toEqual([
      'Old Film',
      'Comma, The Movie',
      'Another Great One',
    ]);
    expect(rated[0].dateWatched).toBe('2020-01-05');
  });

  it('returns an empty list when the CSV cannot be read', () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    expect(getLetterboxdRatings()).toEqual([]);
  });
});

describe('getLetterboxdWatchlist', () => {
  it('returns titled entries with no rating or watch date', () => {
    const watchlist = getLetterboxdWatchlist();

    expect(watchlist).toEqual([
      {
        title: 'Future Watch',
        year: '2019',
        link: 'https://boxd.it/future',
        rating: null,
        dateWatched: null,
        isRewatch: false,
      },
    ]);
  });

  it('returns an empty list when the CSV cannot be read', () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    expect(getLetterboxdWatchlist()).toEqual([]);
  });
});

describe('getLetterboxdStats', () => {
  it('aggregates totals, five-star count, this-year count, and average', () => {
    const stats = getLetterboxdStats();

    expect(stats).toEqual({
      totalFilms: 3,
      totalRated: 3,
      fiveStarFilms: 2,
      thisYearFilms: 2, // the two diary entries watched this year
      averageRating: 4.5, // (3.5 + 5 + 5) / 3, rounded to 2 decimals
    });
  });

  it('reports a zero average when nothing is rated', () => {
    mockReadFileSync.mockImplementation((filePath) => {
      if (String(filePath).includes('ratings.csv')) return 'Date,Name,Year,Letterboxd URI,Rating';
      return DIARY_CSV;
    });

    expect(getLetterboxdStats()).toMatchObject({ totalRated: 0, averageRating: 0 });
  });
});

describe('getTopRatedMovies', () => {
  it('returns only five-star films', () => {
    const top = getTopRatedMovies();
    expect(top.map((m) => m.title)).toEqual(['Comma, The Movie', 'Another Great One']);
  });

  it('respects the limit', () => {
    expect(getTopRatedMovies(1)).toHaveLength(1);
  });
});

describe('getRecentWatches', () => {
  it('sorts the diary by watch date, newest first', () => {
    const recent = getRecentWatches();
    expect(recent.map((m) => m.title)).toEqual([
      'Unrated Film',
      'Comma, The Movie',
      'Old Film',
    ]);
  });

  it('respects the limit', () => {
    expect(getRecentWatches(2)).toHaveLength(2);
  });
});

describe('review attachment', () => {
  // Regression: reviews were originally joined on `Letterboxd URI`, which
  // silently matched nothing because ratings carry film URIs and reviews carry
  // per-viewing entry URIs. The join must use title + year.
  it('attaches reviews across the two URI namespaces', () => {
    const great = getTopRatedMovies().find((m) => m.title === 'Another Great One');

    expect(great?.link).toBe('https://boxd.it/great');
    expect(great?.review).toBe('A tidy little film.');
  });

  it('keeps the most recently watched review when a film was rewatched', () => {
    const old = getRecentWatches().find((m) => m.title === 'Old Film');
    expect(old?.review).toBe('The later take wins.');
  });

  it('preserves reviews containing commas and newlines', () => {
    const comma = getTopRatedMovies().find((m) => m.title === 'Comma, The Movie');
    expect(comma?.review).toBe('Two lines,\nand a comma.');
  });

  it('leaves films without a review untouched', () => {
    const unrated = getRecentWatches().find((m) => m.title === 'Unrated Film');
    expect(unrated?.review).toBeUndefined();
  });
});

describe('getFavoriteFilms', () => {
  it('resolves the profile favourites in the order they are pinned', () => {
    const favorites = getFavoriteFilms();

    // "missing" resolves to nothing and is dropped rather than rendering blank.
    expect(favorites.map((m) => m.title)).toEqual(['Another Great One', 'Comma, The Movie']);
  });

  it('carries the rating and the review through', () => {
    const [first] = getFavoriteFilms();
    expect(first).toMatchObject({ rating: 5, review: 'A tidy little film.' });
  });

  it('returns an empty list when the profile export is missing', () => {
    mockReadFileSync.mockImplementation((filePath) => {
      const p = String(filePath);
      if (p.includes('profile.csv')) throw new Error('ENOENT');
      if (p.includes('ratings.csv')) return RATINGS_CSV;
      return DIARY_CSV;
    });

    expect(getFavoriteFilms()).toEqual([]);
  });

  it('returns an empty list when no favourites are pinned', () => {
    mockReadFileSync.mockImplementation((filePath) => {
      const p = String(filePath);
      if (p.includes('profile.csv')) return 'Date Joined,Username,Favorite Films\n2023-07-25,x,';
      if (p.includes('ratings.csv')) return RATINGS_CSV;
      return DIARY_CSV;
    });

    expect(getFavoriteFilms()).toEqual([]);
  });
});

describe('getReviewedFilms', () => {
  it('returns one entry per reviewed film, newest first', () => {
    const reviewed = getReviewedFilms();

    expect(reviewed.map((m) => m.title)).toEqual([
      'Comma, The Movie',
      'Another Great One',
      'Old Film',
    ]);
  });

  it('prefers the rated record so the star rating survives', () => {
    const [newest] = getReviewedFilms();
    expect(newest).toMatchObject({ rating: 5, link: 'https://boxd.it/comma' });
  });

  it('respects the limit', () => {
    expect(getReviewedFilms(2)).toHaveLength(2);
  });

  it('returns an empty list when there are no reviews', () => {
    mockReadFileSync.mockImplementation((filePath) => {
      const p = String(filePath);
      if (p.includes('reviews.csv')) throw new Error('ENOENT');
      if (p.includes('ratings.csv')) return RATINGS_CSV;
      return DIARY_CSV;
    });

    expect(getReviewedFilms()).toEqual([]);
  });
});
