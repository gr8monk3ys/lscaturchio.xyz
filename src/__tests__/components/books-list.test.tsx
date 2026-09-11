import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BooksList } from '@/components/books/BooksList';
import type { GoodreadsBook, GoodreadsShelf, GoodreadsStats } from '@/lib/goodreads';

const stats: GoodreadsStats = {
  totalBooks: 426,
  booksRead: 72,
  currentlyReading: 2,
  toRead: 349,
  averageRating: 3.5,
  fiveStarBooks: 2,
  totalPages: 15982,
};

let nextId = 0;
function book(overrides: Partial<GoodreadsBook> = {}): GoodreadsBook {
  nextId += 1;
  return {
    id: String(nextId),
    title: 'Siddhartha',
    author: 'Hermann Hesse',
    link: 'https://www.goodreads.com/book/show/1',
    rating: 5,
    averageRating: 3.98,
    dateRead: '2024/03/02',
    dateAdded: '2024/01/05',
    shelf: 'read',
    bookshelves: ['books-that-changed-my-life'],
    pages: 152,
    yearPublished: 1922,
    isbn: null,
    ...overrides,
  };
}

const perfectScores = [
  book(),
  book({ title: "Man's Search for Meaning", author: 'Viktor E. Frankl', yearPublished: 1946 }),
];
const currentlyReading = [
  book({ title: 'The Master and Margarita', author: 'Mikhail Bulgakov', rating: null, shelf: 'currently-reading' }),
];
const recentlyRead = [book({ title: 'The Trial', author: 'Franz Kafka', rating: 4, pages: 255 })];
const toRead = [book({ title: 'Ulysses', author: 'James Joyce', rating: null, shelf: 'to-read' })];
const shelves: GoodreadsShelf[] = [
  {
    name: 'books-for-existential-crises',
    label: 'Books for existential crises',
    books: [book({ title: '1984', author: 'George Orwell' })],
  },
];

/** A shelf deeper than the preview, the way `21st century` is in the real export. */
function deepShelf(size: number): GoodreadsShelf {
  return {
    name: '21st-century',
    label: '21st century',
    books: Array.from({ length: size }, (_, index) =>
      book({ title: `Shelved title ${index + 1}` })
    ),
  };
}

function renderList() {
  return render(
    <BooksList
      stats={stats}
      perfectScores={perfectScores}
      currentlyReading={currentlyReading}
      recentlyRead={recentlyRead}
      toRead={toRead}
      shelves={shelves}
    />
  );
}

describe('BooksList', () => {
  it('renders the full-marks books as a numbered list with author and shelves', () => {
    renderList();

    expect(screen.getByRole('heading', { name: 'Full marks' })).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('Viktor E. Frankl')).toBeInTheDocument();
    // Shelf slugs render humanised (dashes stripped) on the plate.
    expect(screen.getAllByText(/books that changed my life/).length).toBeGreaterThan(0);
  });

  it('renders the custom shelves with their books', () => {
    renderList();
    expect(screen.getByText('Books for existential crises')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /1984/ })).toHaveAttribute(
      'href',
      expect.stringContaining('goodreads.com')
    );
  });

  it('defaults to the reading-now tab and switches on click', () => {
    renderList();

    expect(screen.getByText('The Master and Margarita')).toBeInTheDocument();
    expect(screen.queryByText('Ulysses')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Want to Read/ }));
    expect(screen.getByText('Ulysses')).toBeInTheDocument();
    expect(screen.queryByText('The Master and Margarita')).not.toBeInTheDocument();
  });

  it('marks the active tab with aria-pressed and shows counts', () => {
    renderList();

    expect(screen.getByRole('button', { name: /Reading Now\s*1/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    fireEvent.click(screen.getByRole('button', { name: /Finished/ }));
    expect(screen.getByRole('button', { name: /Finished/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows page counts and accessible star ratings on finished books', () => {
    renderList();
    fireEvent.click(screen.getByRole('button', { name: /Finished/ }));

    expect(screen.getByText('255 pp')).toBeInTheDocument();
    expect(screen.getByLabelText('4 out of 5 stars')).toBeInTheDocument();
  });

  it('renders the stats wall', () => {
    renderList();
    expect(screen.getByText('15,982')).toBeInTheDocument();
    expect(screen.getByText('Pages Read')).toBeInTheDocument();
    expect(screen.getByText('Queued')).toBeInTheDocument();
  });

  it('sets a derived count beside every shelf label', () => {
    render(
      <BooksList
        stats={stats}
        perfectScores={perfectScores}
        currentlyReading={currentlyReading}
        recentlyRead={recentlyRead}
        toRead={toRead}
        shelves={[deepShelf(10)]}
      />
    );

    const label = screen.getByText('21st century');
    expect(label.parentElement).toHaveTextContent('10');
  });

  it('shows only the first six titles of a deep shelf and folds the rest', () => {
    render(
      <BooksList
        stats={stats}
        perfectScores={perfectScores}
        currentlyReading={currentlyReading}
        recentlyRead={recentlyRead}
        toRead={toRead}
        shelves={[deepShelf(10)]}
      />
    );

    // The first six sit in the open row; the other four are inside a closed
    // disclosure, so they are in the DOM but not painted.
    expect(screen.getByText(/Shelved title 6/).closest('details')).toBeNull();
    const folded = screen.getByText(/Shelved title 7/).closest('details');
    expect(folded).not.toBeNull();
    expect(folded).not.toHaveAttribute('open');
    expect(screen.getByText(/Shelved title 10/).closest('details')).toBe(folded);
  });

  it('names the shelf and the remainder in the disclosure summary', () => {
    render(
      <BooksList
        stats={stats}
        perfectScores={perfectScores}
        currentlyReading={currentlyReading}
        recentlyRead={recentlyRead}
        toRead={toRead}
        shelves={[deepShelf(100)]}
      />
    );

    // 100 minus the six on show. Derived from the array in the component, so a
    // data refresh cannot make this line a lie.
    expect(screen.getByText('94 more in 21st century')).toBeInTheDocument();
  });

  it('leaves a shelf at or under the preview unfolded', () => {
    render(
      <BooksList
        stats={stats}
        perfectScores={perfectScores}
        currentlyReading={currentlyReading}
        recentlyRead={recentlyRead}
        toRead={toRead}
        shelves={[deepShelf(6)]}
      />
    );

    expect(screen.queryByText(/more in 21st century/)).not.toBeInTheDocument();
    expect(screen.getByText(/Shelved title 6/)).toBeInTheDocument();
  });

  it('omits full-marks and shelves sections when their data is empty', () => {
    render(
      <BooksList
        stats={stats}
        perfectScores={[]}
        currentlyReading={currentlyReading}
        recentlyRead={recentlyRead}
        toRead={toRead}
        shelves={[]}
      />
    );

    expect(screen.queryByRole('heading', { name: 'Full marks' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Shelves' })).not.toBeInTheDocument();
  });
});
