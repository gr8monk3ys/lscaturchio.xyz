import fs from 'fs';
import path from 'path';
import { logError } from './logger';

export interface LetterboxdMovie {
  title: string;
  year: string;
  link: string;
  rating: number | null;
  dateWatched: string | null;
  isRewatch: boolean;
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
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
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
      return { title, year, rating: Number.isFinite(rating) ? rating : null };
    }
    return null;
  } catch (error) {
    logError('Letterboxd RSS fetch failed', error, { module: 'letterboxd' });
    return null;
  }
}

// Parse CSV data
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
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

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Get movies from local CSV data
export function getLetterboxdMovies(): LetterboxdMovie[] {
  try {
    const diaryPath = path.join(process.cwd(), 'public/my-data/letterboxd/diary.csv');
    const csvText = fs.readFileSync(diaryPath, 'utf-8');
    const rows = parseCSV(csvText);

    return rows.map(row => ({
      title: row['Name'] || '',
      year: row['Year'] || '',
      link: row['Letterboxd URI'] || '',
      rating: row['Rating'] ? parseFloat(row['Rating']) : null,
      dateWatched: row['Watched Date'] || null,
      isRewatch: row['Rewatch'] === 'Yes',
    })).filter(m => m.title);
  } catch (error) {
    logError('Error reading Letterboxd diary', error, { module: 'letterboxd' });
    return [];
  }
}

// Get all rated movies
export function getLetterboxdRatings(): LetterboxdMovie[] {
  try {
    const ratingsPath = path.join(process.cwd(), 'public/my-data/letterboxd/ratings.csv');
    const csvText = fs.readFileSync(ratingsPath, 'utf-8');
    const rows = parseCSV(csvText);

    return rows.map(row => ({
      title: row['Name'] || '',
      year: row['Year'] || '',
      link: row['Letterboxd URI'] || '',
      rating: row['Rating'] ? parseFloat(row['Rating']) : null,
      dateWatched: row['Date'] || null,
      isRewatch: false,
    })).filter(m => m.title && m.rating);
  } catch (error) {
    logError('Error reading Letterboxd ratings', error, { module: 'letterboxd' });
    return [];
  }
}

// Get watchlist
export function getLetterboxdWatchlist(): LetterboxdMovie[] {
  try {
    const watchlistPath = path.join(process.cwd(), 'public/my-data/letterboxd/watchlist.csv');
    const csvText = fs.readFileSync(watchlistPath, 'utf-8');
    const rows = parseCSV(csvText);

    return rows.map(row => ({
      title: row['Name'] || '',
      year: row['Year'] || '',
      link: row['Letterboxd URI'] || '',
      rating: null,
      dateWatched: null,
      isRewatch: false,
    })).filter(m => m.title);
  } catch (error) {
    logError('Error reading Letterboxd watchlist', error, { module: 'letterboxd' });
    return [];
  }
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
export function getTopRatedMovies(limit: number = 20): LetterboxdMovie[] {
  const ratings = getLetterboxdRatings();
  return ratings
    .filter(m => m.rating === 5)
    .slice(0, limit);
}

// Get recent watches sorted by date
export function getRecentWatches(limit: number = 20): LetterboxdMovie[] {
  const diary = getLetterboxdMovies();
  return diary
    .sort((a, b) => {
      if (!a.dateWatched || !b.dateWatched) return 0;
      return new Date(b.dateWatched).getTime() - new Date(a.dateWatched).getTime();
    })
    .slice(0, limit);
}
