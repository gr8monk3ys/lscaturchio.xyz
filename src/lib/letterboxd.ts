import fs from 'fs';
import path from 'path';
import { parseCsv } from './csv';
import { logError } from './logger';

export interface LetterboxdMovie {
  title: string;
  year: string;
  link: string;
  rating: number | null;
  dateWatched: string | null;
  isRewatch: boolean;
  /** My own review text, when I wrote one. Only attached by the functions that ask for it. */
  review?: string;
}

export interface LetterboxdStats {
  totalFilms: number;
  totalRated: number;
  averageRating: number;
  fiveStarFilms: number;
  thisYearFilms: number;
}

const LETTERBOXD_USER = 'gr8monk3ys';

function firstTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) return null;
  // &amp; decodes last — decoding it first double-unescapes "&amp;lt;" to "<".
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * The most recently watched film, fetched live from Letterboxd's public RSS
 * feed (no API key required) and revalidated hourly. Returns null on any
 * failure so callers can fall back to the committed CSV snapshot — the feed is
 * a nicety, not a dependency.
 */
export async function getLiveLastWatch(): Promise<{
  title: string;
  year: string;
  rating: number | null;
} | null> {
  try {
    const res = await fetch(`https://letterboxd.com/${LETTERBOXD_USER}/rss/`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const xml = await res.text();

    // Walk items in order; the first diary entry (has a filmTitle) is the
    // latest watch. Reviews/lists without a filmTitle are skipped.
    const items = xml.split('<item>').slice(1);
    for (const item of items) {
      const title = firstTag(item, 'letterboxd:filmTitle');
      if (!title) continue;
      const year = firstTag(item, 'letterboxd:filmYear') ?? '';
      const ratingRaw = firstTag(item, 'letterboxd:memberRating');
      const rating = ratingRaw ? Number.parseFloat(ratingRaw) : null;
      // Letterboxd ratings are 0.5–5.0; reject anything outside so a malformed
      // feed can't render as e.g. "999★".
      const validRating =
        rating !== null && Number.isFinite(rating) && rating >= 0.5 && rating <= 5
          ? rating
          : null;
      return { title, year, rating: validRating };
    }
    return null;
  } catch (error) {
    logError('Letterboxd RSS fetch failed', error, { module: 'letterboxd' });
    return null;
  }
}

/** Read one of the committed Letterboxd export files; missing files parse as empty. */
function readExport(file: string, context: string): Record<string, string>[] {
  try {
    const filePath = path.join(process.cwd(), 'public/my-data/letterboxd', file);
    return parseCsv(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    logError(context, error, { module: 'letterboxd' });
    return [];
  }
}

// Get movies from local CSV data
export function getLetterboxdMovies(): LetterboxdMovie[] {
  return readExport('diary.csv', 'Error reading Letterboxd diary')
    .map(row => ({
      title: row['Name'] || '',
      year: row['Year'] || '',
      link: row['Letterboxd URI'] || '',
      rating: row['Rating'] ? parseFloat(row['Rating']) : null,
      dateWatched: row['Watched Date'] || null,
      isRewatch: row['Rewatch'] === 'Yes',
    }))
    .filter(m => m.title);
}

// Get all rated movies
export function getLetterboxdRatings(): LetterboxdMovie[] {
  return readExport('ratings.csv', 'Error reading Letterboxd ratings')
    .map(row => ({
      title: row['Name'] || '',
      year: row['Year'] || '',
      link: row['Letterboxd URI'] || '',
      rating: row['Rating'] ? parseFloat(row['Rating']) : null,
      dateWatched: row['Date'] || null,
      isRewatch: false,
    }))
    .filter(m => m.title && m.rating);
}

// Get watchlist
export function getLetterboxdWatchlist(): LetterboxdMovie[] {
  return readExport('watchlist.csv', 'Error reading Letterboxd watchlist')
    .map(row => ({
      title: row['Name'] || '',
      year: row['Year'] || '',
      link: row['Letterboxd URI'] || '',
      rating: null,
      dateWatched: null,
      isRewatch: false,
    }))
    .filter(m => m.title);
}

/**
 * Join key for a film across the export files.
 *
 * Letterboxd uses two different URI namespaces: `ratings.csv`, `watchlist.csv`
 * and the profile's favourites store the *film* URI (`boxd.it/251c`), while
 * `diary.csv` and `reviews.csv` store the *entry* URI for one specific viewing
 * (`boxd.it/8mdUF3`). Joining on `Letterboxd URI` across files therefore matches
 * nothing at all. Title + year is the only identifier common to every export.
 */
function filmKey(title: string, year: string): string {
  return `${title.trim().toLowerCase()}|${year.trim()}`;
}

/**
 * My written reviews, keyed by film. A rewatched film has one review row per
 * viewing, so the most recently watched review wins.
 */
function getReviewsByFilm(): Map<string, string> {
  const rows = readExport('reviews.csv', 'Error reading Letterboxd reviews');
  const latest = new Map<string, { review: string; watched: string }>();

  for (const row of rows) {
    const review = row['Review'];
    const title = row['Name'];
    if (!review || !title) continue;

    const key = filmKey(title, row['Year'] || '');
    const watched = row['Watched Date'] || row['Date'] || '';
    const existing = latest.get(key);
    if (!existing || watched >= existing.watched) {
      latest.set(key, { review, watched });
    }
  }

  return new Map(Array.from(latest, ([key, value]) => [key, value.review]));
}

/** Attach my review text to any film I wrote about. */
function withReviews(movies: LetterboxdMovie[]): LetterboxdMovie[] {
  const reviews = getReviewsByFilm();
  return movies.map(movie => {
    const review = reviews.get(filmKey(movie.title, movie.year));
    return review ? { ...movie, review } : movie;
  });
}

/**
 * The four films pinned as favourites on my Letterboxd profile. The export
 * stores them as bare `boxd.it` URIs, so they are resolved against the ratings
 * and diary exports rather than hard-coded or fetched.
 */
export function getFavoriteFilms(): LetterboxdMovie[] {
  const [profile] = readExport('profile.csv', 'Error reading Letterboxd profile');
  if (!profile) return [];

  const uris = (profile['Favorite Films'] || '')
    .split(',')
    .map(uri => uri.trim())
    .filter(Boolean);
  if (uris.length === 0) return [];

  const byUri = new Map<string, LetterboxdMovie>();
  for (const movie of [...getLetterboxdMovies(), ...getLetterboxdRatings()]) {
    // Ratings win over diary entries: they carry the rating for every film,
    // including ones watched before I kept a diary.
    if (movie.link) byUri.set(movie.link, movie);
  }

  const resolved = uris
    .map(uri => byUri.get(uri))
    .filter((movie): movie is LetterboxdMovie => Boolean(movie));

  return withReviews(resolved);
}

/** Films I actually wrote something about, newest first. */
export function getReviewedFilms(limit?: number): LetterboxdMovie[] {
  const reviews = getReviewsByFilm();
  const seen = new Set<string>();

  // Ratings first so a reviewed film carries its star rating; the diary fills in
  // anything rated before I kept one.
  const reviewed = [...getLetterboxdRatings(), ...getLetterboxdMovies()]
    .filter(movie => {
      const key = filmKey(movie.title, movie.year);
      if (!reviews.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(movie => ({ ...movie, review: reviews.get(filmKey(movie.title, movie.year)) as string }))
    .sort((a, b) => (b.dateWatched ?? '').localeCompare(a.dateWatched ?? ''));

  return limit ? reviewed.slice(0, limit) : reviewed;
}

// Calculate stats
export function getLetterboxdStats(): LetterboxdStats {
  const ratings = getLetterboxdRatings();
  const diary = getLetterboxdMovies();
  const currentYear = new Date().getFullYear();

  const totalRated = ratings.length;
  const totalFilms = diary.length;
  const fiveStarFilms = ratings.filter(m => m.rating === 5).length;
  const thisYearFilms = diary.filter(m => {
    if (!m.dateWatched) return false;
    const year = parseInt(m.dateWatched.split('-')[0]);
    return year === currentYear;
  }).length;

  const averageRating = totalRated > 0
    ? ratings.reduce((sum, m) => sum + (m.rating || 0), 0) / totalRated
    : 0;

  return {
    totalFilms,
    totalRated,
    averageRating: Math.round(averageRating * 100) / 100,
    fiveStarFilms,
    thisYearFilms,
  };
}

// Get top rated movies (5 stars)
export function getTopRatedMovies(limit?: number): LetterboxdMovie[] {
  const fiveStar = getLetterboxdRatings()
    .filter(m => m.rating === 5)
    .sort((a, b) => (b.dateWatched ?? '').localeCompare(a.dateWatched ?? ''));

  return withReviews(limit ? fiveStar.slice(0, limit) : fiveStar);
}

// Get recent watches sorted by date
export function getRecentWatches(limit: number = 20): LetterboxdMovie[] {
  const diary = getLetterboxdMovies();
  return withReviews(
    diary
      .sort((a, b) => {
        if (!a.dateWatched || !b.dateWatched) return 0;
        return new Date(b.dateWatched).getTime() - new Date(a.dateWatched).getTime();
      })
      .slice(0, limit)
  );
}
