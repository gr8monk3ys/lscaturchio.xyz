import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import type { CsvTable } from './csv';
import { logError, logWarn } from './logger';
import {
  diaryTable,
  filmKey,
  parseLetterboxdRss,
  parseRating,
  profileTable,
  ratingsTable,
  reviewsTable,
  REWATCH_YES,
  watchlistTable,
  type DiaryRecord,
  type ProfileRecord,
  type RatingRecord,
  type ReviewRecord,
  type WatchlistRecord,
} from './letterboxd-format';

export interface LetterboxdMovie {
  title: string;
  year: string;
  link: string;
  rating: number | null;
  dateWatched: string | null;
  isRewatch: boolean;
  /** My own review text, when I wrote one. Only attached by the queries that ask for it. */
  review?: string;
}

export interface LetterboxdStats {
  totalFilms: number;
  totalRated: number;
  averageRating: number;
  fiveStarFilms: number;
  thisYearFilms: number;
}

/** The export files the library is built from, as parsed records. */
export interface LetterboxdExports {
  diary: DiaryRecord[];
  ratings: RatingRecord[];
  reviews: ReviewRecord[];
  watchlist: WatchlistRecord[];
  profile: ProfileRecord[];
}

/** One read of the Letterboxd exports, queried by the pages. */
export interface LetterboxdLibrary {
  stats(): LetterboxdStats;
  /** The four films pinned on my profile, in pinned order, with reviews. */
  favorites(): LetterboxdMovie[];
  /** Five-star films, most recently rated first, with reviews. */
  topRated(limit?: number): LetterboxdMovie[];
  /** Films I actually wrote something about, newest first. */
  reviewed(limit?: number): LetterboxdMovie[];
  /** Diary entries, most recently watched first, with reviews. */
  recentWatches(limit?: number): LetterboxdMovie[];
  watchlist(limit?: number): LetterboxdMovie[];
}

const LETTERBOXD_USER = 'gr8monk3ys';

/**
 * The most recently watched film, fetched live from Letterboxd's public RSS
 * feed (no API key required) and revalidated hourly. Returns null on any
 * failure so callers can fall back to the committed CSV snapshot — the feed is
 * a nicety, not a dependency. `fetchFeed` is the seam tests replace.
 */
export async function getLiveLastWatch(fetchFeed: typeof fetch = fetch): Promise<{
  title: string;
  year: string;
  rating: number | null;
} | null> {
  try {
    const res = await fetchFeed(`https://letterboxd.com/${LETTERBOXD_USER}/rss/`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    // The first film entry is the latest watch, dated or not.
    const [latest] = parseLetterboxdRss(await res.text());
    if (!latest) return null;
    return { title: latest.title, year: latest.year, rating: parseRating(latest.rating) };
  } catch (error) {
    // `logWarn`, not `logError`. An optional third-party feed with a designed
    // fallback — this function's own comment calls it "a nicety, not a
    // dependency" — and Letterboxd sits behind Cloudflare, which closes the
    // socket often enough that Vercel's runtime-error dashboard showed one
    // error group for the entire site: 13 occurrences, 12 users, seven
    // routes, all of it this. An expected failure that degrades correctly is
    // not an error, and filing it as one teaches the reader of that dashboard
    // to ignore it.
    //
    // The signal survives — `logWarn` still sends `Sentry.captureMessage` at
    // warning level in production. It stops writing `console.error`, which is
    // what Vercel groups on.
    logWarn('Letterboxd RSS fetch failed', {
      module: 'letterboxd',
      cause: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/** Newest first by an ISO date string; undated entries sort last. */
const byDateDesc = (a: LetterboxdMovie, b: LetterboxdMovie) =>
  (b.dateWatched ?? '').localeCompare(a.dateWatched ?? '');

const take = <T>(items: T[], limit?: number) => (limit ? items.slice(0, limit) : items.slice());

/** Build the library from parsed export records. Pure — tests start here. */
export function createLetterboxdLibrary(records: LetterboxdExports): LetterboxdLibrary {
  const diary: LetterboxdMovie[] = records.diary
    .map((row) => ({
      title: row.title,
      year: row.year,
      link: row.uri,
      rating: parseRating(row.rating),
      dateWatched: row.watchedDate || null,
      isRewatch: row.rewatch === REWATCH_YES,
    }))
    .filter((m) => m.title);

  const ratings: LetterboxdMovie[] = records.ratings
    .map((row) => ({
      title: row.title,
      year: row.year,
      link: row.uri,
      rating: parseRating(row.rating),
      dateWatched: row.date || null,
      isRewatch: false,
    }))
    .filter((m) => m.title && m.rating);

  const watchlist: LetterboxdMovie[] = records.watchlist
    .map((row) => ({
      title: row.title,
      year: row.year,
      link: row.uri,
      rating: null,
      dateWatched: null,
      isRewatch: false,
    }))
    .filter((m) => m.title);

  // My written reviews, keyed by film. A rewatched film has one review row per
  // viewing, so the most recently watched review wins.
  const latestReview = new Map<string, { review: string; watched: string }>();
  for (const row of records.reviews) {
    if (!row.review || !row.title) continue;
    const key = filmKey(row.title, row.year);
    const watched = row.watchedDate || row.date;
    const existing = latestReview.get(key);
    if (!existing || watched >= existing.watched) {
      latestReview.set(key, { review: row.review, watched });
    }
  }
  const reviewOf = (movie: LetterboxdMovie) => latestReview.get(filmKey(movie.title, movie.year))?.review;

  /** Attach my review text to any film I wrote about. */
  const withReviews = (movies: LetterboxdMovie[]) =>
    movies.map((movie) => {
      const review = reviewOf(movie);
      return review ? { ...movie, review } : movie;
    });

  return {
    stats() {
      const currentYear = new Date().getFullYear();
      const totalRated = ratings.length;
      const averageRating =
        totalRated > 0 ? ratings.reduce((sum, m) => sum + (m.rating || 0), 0) / totalRated : 0;

      return {
        totalFilms: diary.length,
        totalRated,
        averageRating: Math.round(averageRating * 100) / 100,
        fiveStarFilms: ratings.filter((m) => m.rating === 5).length,
        thisYearFilms: diary.filter(
          (m) => m.dateWatched !== null && parseInt(m.dateWatched.split('-')[0]) === currentYear,
        ).length,
      };
    },

    favorites() {
      // The export stores favourites as bare film URIs, so they resolve against
      // the diary and ratings rather than being hard-coded or fetched.
      const uris = (records.profile[0]?.favoriteFilms ?? '')
        .split(',')
        .map((uri) => uri.trim())
        .filter(Boolean);
      if (uris.length === 0) return [];

      const byUri = new Map<string, LetterboxdMovie>();
      for (const movie of [...diary, ...ratings]) {
        // Ratings win over diary entries: they carry the rating for every film,
        // including ones watched before I kept a diary.
        if (movie.link) byUri.set(movie.link, movie);
      }

      return withReviews(
        uris.map((uri) => byUri.get(uri)).filter((movie): movie is LetterboxdMovie => Boolean(movie)),
      );
    },

    topRated(limit) {
      return withReviews(take(ratings.filter((m) => m.rating === 5).sort(byDateDesc), limit));
    },

    reviewed(limit) {
      const seen = new Set<string>();
      // Ratings first so a reviewed film carries its star rating; the diary
      // fills in anything rated before I kept one.
      const reviewed = [...ratings, ...diary]
        .filter((movie) => {
          const key = filmKey(movie.title, movie.year);
          if (!latestReview.has(key) || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((movie) => ({ ...movie, review: reviewOf(movie) as string }))
        .sort(byDateDesc);

      return take(reviewed, limit);
    },

    recentWatches(limit = 20) {
      return withReviews(
        [...diary]
          .sort((a, b) => {
            if (!a.dateWatched || !b.dateWatched) return 0;
            return new Date(b.dateWatched).getTime() - new Date(a.dateWatched).getTime();
          })
          .slice(0, limit),
      );
    },

    watchlist(limit) {
      return take(watchlist, limit);
    },
  };
}

/** Read one committed export through its table; a missing file reads as empty. */
function readExport<F extends string>(table: CsvTable<F>, file: string): Record<F, string>[] {
  try {
    const filePath = path.join(process.cwd(), 'public/my-data/letterboxd', file);
    return table.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    logError(`Error reading Letterboxd ${file}`, error, { module: 'letterboxd' });
    return [];
  }
}

/**
 * The Letterboxd library for this render. `cache` scopes it to one server
 * request, so a page that asks several questions reads and parses each export
 * once — and the next request (or ISR revalidation) reads the files afresh,
 * exactly as before.
 */
export const getLetterboxdLibrary = cache(
  (): LetterboxdLibrary =>
    createLetterboxdLibrary({
      diary: readExport(diaryTable, 'diary.csv'),
      ratings: readExport(ratingsTable, 'ratings.csv'),
      reviews: readExport(reviewsTable, 'reviews.csv'),
      watchlist: readExport(watchlistTable, 'watchlist.csv'),
      profile: readExport(profileTable, 'profile.csv'),
    }),
);
