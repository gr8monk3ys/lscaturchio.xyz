import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BlogSidebar, EssayContentsInline } from '@/components/blog/blog-sidebar';

/**
 * The contents rail, which reads the essay's own headings out of the DOM.
 *
 * The bug these tests exist for: the rail returned null until its effect found
 * headings, which on first paint is always. That left the parent
 * `xl:grid-cols-[260px_1fr]` with exactly one child — and CSS grid puts a lone
 * child in the *first* track — so every essay above 1280px rendered 260px wide
 * inside the rail's column and then jumped into `1fr` when the rail mounted.
 * Lighthouse measured 0.2629 cumulative layout shift on the essay route
 * against a 0.15 budget, deterministic across three runs, and attributed
 * 0.2573 of it to the prose column. Holding the cell brought it to 0.0027.
 *
 * `e2e/layout-shift.spec.ts` guards the number in a browser; these guard the
 * cause, and the heading logic the rail is built on, without one.
 */

/** The rail scopes its scan to `.prose-gallery`, falling back to `article`. */
function mountEssay(html: string) {
  const root = document.createElement('div');
  root.className = 'prose-gallery';
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

/** The rail's own observer callback, captured so a scroll can be simulated. */
let notifyIntersection: ((entries: Array<{ isIntersecting: boolean; target: Element }>) => void) | null =
  null;

beforeEach(() => {
  notifyIntersection = null;
  // jsdom has no IntersectionObserver, and the rail observes every heading.
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (entries: Array<{ isIntersecting: boolean; target: Element }>) => void) {
        notifyIntersection = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds = [];
    }
  );
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BlogSidebar', () => {
  it('holds its grid cell before any heading is found', () => {
    // No `.prose-gallery` and no `<article>`, so the scan finds no root and the
    // heading list stays empty — first-paint conditions.
    render(<BlogSidebar slug="whatever" />);

    const rail = screen.getByLabelText('Article sidebar');
    expect(rail.tagName).toBe('ASIDE');
  });

  it('draws no border until it has contents', () => {
    render(<BlogSidebar slug="whatever" />);

    // An empty cell must be invisible, or the fix trades a shift for a stray
    // 260px box on every essay.
    const rail = screen.getByLabelText('Article sidebar');
    expect(rail.querySelector('nav')).toBeNull();
    expect(rail.className).not.toMatch(/\bborder\b/);
  });

  it('lists the essay h2s and h3s, and nothing from the end matter', () => {
    mountEssay('<h2>Retrieval</h2><h3>Chunking</h3><h4>Ignored</h4>');
    // Outside `.prose-gallery`: the end matter the rail must not index.
    const after = document.createElement('h2');
    after.textContent = 'Comments';
    document.body.appendChild(after);

    render(<BlogSidebar slug="essay" />);

    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeInTheDocument();
    expect(screen.getByText('On this page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retrieval' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chunking' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ignored' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Comments' })).toBeNull();
  });

  it('indents an h3 under its h2', () => {
    mountEssay('<h2>Retrieval</h2><h3>Chunking</h3>');
    render(<BlogSidebar slug="essay" />);

    const nested = screen.getByRole('button', { name: 'Chunking' }).closest('li');
    expect(nested?.className).toContain('pl-4');
    const top = screen.getByRole('button', { name: 'Retrieval' }).closest('li');
    expect(top?.className).not.toContain('pl-4');
  });

  it('writes an id onto every heading it indexes', () => {
    const root = mountEssay('<h2>Why RAG at all?</h2>');
    render(<BlogSidebar slug="essay" />);

    // The anchor has to exist in the document for the scroll target to resolve.
    expect(root.querySelector('h2')?.id).toBe('why-rag-at-all');
  });

  it('gives two identically named headings distinct anchors', () => {
    const root = mountEssay('<h2>Trade-offs</h2><h2>Trade-offs</h2><h2>Trade-offs</h2>');
    render(<BlogSidebar slug="essay" />);

    const ids = Array.from(root.querySelectorAll('h2')).map((h) => h.id);
    expect(ids).toEqual(['trade-offs', 'trade-offs-2', 'trade-offs-3']);
    // Without the seen-set, three rows would collapse onto one anchor.
    expect(new Set(ids).size).toBe(3);
  });

  it('marks the section that scrolled into view, and only that one', () => {
    const root = mountEssay('<h2>Retrieval</h2><h2>Chunking</h2>');
    render(<BlogSidebar slug="essay" />);

    const [first, second] = Array.from(root.querySelectorAll('h2'));
    // `classList`, not a substring match: the base class carries
    // `hover:text-primary`, which contains the active class as a substring.
    const activeFor = (name: string) =>
      screen.getByRole('button', { name }).classList.contains('text-primary');

    expect(activeFor('Retrieval')).toBe(false);

    act(() => {
      notifyIntersection?.([
        { isIntersecting: true, target: first },
        // A section leaving the viewport must not claim the highlight.
        { isIntersecting: false, target: second },
      ]);
    });

    expect(activeFor('Retrieval')).toBe(true);
    expect(activeFor('Chunking')).toBe(false);
  });

  it('scrolls to the heading when a row is clicked', () => {
    const root = mountEssay('<h2>Retrieval</h2>');
    const scrollIntoView = vi.fn();
    const heading = root.querySelector('h2') as HTMLElement;
    heading.scrollIntoView = scrollIntoView;

    render(<BlogSidebar slug="essay" />);
    fireEvent.click(screen.getByRole('button', { name: 'Retrieval' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('jumps without animating under prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const root = mountEssay('<h2>Retrieval</h2>');
    const scrollIntoView = vi.fn();
    (root.querySelector('h2') as HTMLElement).scrollIntoView = scrollIntoView;

    render(<BlogSidebar slug="essay" />);
    fireEvent.click(screen.getByRole('button', { name: 'Retrieval' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });
});

describe('EssayContentsInline', () => {
  it('renders nothing when there are no headings', () => {
    const { container } = render(<EssayContentsInline slug="whatever" />);

    // Unlike the rail, this one sits in normal flow under the essay header, so
    // rendering an empty disclosure would be a stray element rather than a
    // reserved cell.
    expect(container.querySelector('details')).toBeNull();
  });

  it('counts the sections it found in its summary', () => {
    mountEssay('<h2>One</h2><h2>Two</h2><h3>Three</h3>');
    render(<EssayContentsInline slug="essay" />);

    expect(screen.getByText(/On this page · 3 sections/)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeInTheDocument();
  });
});
