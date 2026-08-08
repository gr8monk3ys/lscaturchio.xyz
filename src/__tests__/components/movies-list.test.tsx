import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MoviesList } from '@/components/movies/MoviesList';
import type { LetterboxdMovie, LetterboxdStats } from '@/lib/letterboxd';

const stats: LetterboxdStats = {
  totalFilms: 231,
  totalRated: 1528,
  averageRating: 3.11,
  fiveStarFilms: 2,
  thisYearFilms: 4,
};

function movie(overrides: Partial<LetterboxdMovie> = {}): LetterboxdMovie {
  return {
    title: 'Ikiru',
    year: '1952',
    link: 'https://boxd.it/251c',
    rating: 5,
    dateWatched: '2025-01-07',
    isRewatch: false,
    ...overrides,
  };
}

const favorites = [
  movie(),
  movie({ title: 'Before Sunrise', year: '1995', link: 'https://boxd.it/2bcU', review: 'It MOVED me.' }),
];
const fiveStar = [movie(), movie({ title: 'Ran', year: '1985', link: 'https://boxd.it/ran' })];
const reviewed = [movie({ review: 'An urgent catalyst for legacy.' })];
const recentWatches = [movie({ title: 'Tangerine', year: '2015', link: 'https://boxd.it/tang', rating: 4 })];
const watchlist = [movie({ title: 'Stalker', year: '1979', link: 'https://boxd.it/stalker', rating: null, dateWatched: null })];

function renderList() {
  return render(
    <MoviesList
      stats={stats}
      favorites={favorites}
      fiveStar={fiveStar}
      reviewed={reviewed}
      recentWatches={recentWatches}
      watchlist={watchlist}
    />
  );
}

describe('MoviesList', () => {
  it('renders the pinned favourites as a numbered list with review text', () => {
    renderList();

    const favSection = screen.getByRole('heading', { name: 'The Four' }).closest('section');
    expect(favSection).not.toBeNull();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText(/It MOVED me\./)).toBeInTheDocument();
  });

  it('links every film out to Letterboxd', () => {
    renderList();
    const link = screen.getByRole('link', { name: /Before Sunrise/ });
    expect(link).toHaveAttribute('href', 'https://boxd.it/2bcU');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('shows the five-star tab by default and switches on click', () => {
    renderList();

    // Default tab: five-star films are visible, watchlist is not.
    expect(screen.getByText('Ran')).toBeInTheDocument();
    expect(screen.queryByText('Stalker')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Watchlist/ }));
    expect(screen.getByText('Stalker')).toBeInTheDocument();
    expect(screen.queryByText('Ran')).not.toBeInTheDocument();
  });

  it('marks the active tab with aria-pressed', () => {
    renderList();
    expect(screen.getByRole('button', { name: /Five Stars/ })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Recent/ }));
    expect(screen.getByRole('button', { name: /Recent/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Five Stars/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows each tab count in its button', () => {
    renderList();
    // fiveStar has 2 entries; the count renders inside the button.
    expect(screen.getByRole('button', { name: /Five Stars\s*2/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Written About\s*1/ })).toBeInTheDocument();
  });

  it('renders review text inside the reviewed tab rows', () => {
    renderList();
    fireEvent.click(screen.getByRole('button', { name: /Written About/ }));
    expect(screen.getByText(/urgent catalyst for legacy/)).toBeInTheDocument();
  });

  it('exposes ratings as accessible star labels, not icon soup', () => {
    renderList();
    fireEvent.click(screen.getByRole('button', { name: /Recent/ }));
    expect(screen.getByLabelText('4 out of 5 stars')).toBeInTheDocument();
  });

  it('renders the stats wall with the written-about count derived from the reviewed list', () => {
    renderList();
    expect(screen.getByText('1,528')).toBeInTheDocument();
    expect(screen.getByText('Films Rated')).toBeInTheDocument();
    // "Written About" is both a stat label and a tab name, so expect both.
    expect(screen.getAllByText('Written About')).toHaveLength(2);
  });

  it('omits the favourites section entirely when the profile export is missing', () => {
    render(
      <MoviesList
        stats={stats}
        favorites={[]}
        fiveStar={fiveStar}
        reviewed={reviewed}
        recentWatches={recentWatches}
        watchlist={watchlist}
      />
    );
    expect(screen.queryByRole('heading', { name: 'The Four' })).not.toBeInTheDocument();
  });
});
