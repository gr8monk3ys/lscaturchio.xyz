import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import useSWR from 'swr';
import { RelatedPosts } from '@/components/blog/related-posts';

vi.mock('swr', () => ({ default: vi.fn() }));
const mockUseSWR = vi.mocked(useSWR);

const post = {
  title: 'Strikes Work',
  url: '/blog/strikes-work',
  description: 'Labor history without the amnesia.',
  date: '2025-06-02',
  image: '/images/blog/strikes-work.webp',
};

function swrState(state: Partial<{ data: unknown; isLoading: boolean; error: unknown }>) {
  mockUseSWR.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: undefined,
    mutate: vi.fn(),
    isValidating: false,
    ...state,
  } as ReturnType<typeof useSWR>);
}

describe('RelatedPosts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requests related posts keyed by title and url', () => {
    swrState({ isLoading: true });
    render(<RelatedPosts currentTitle="A & B" currentUrl="/blog/a-b" />);
    expect(mockUseSWR).toHaveBeenCalledWith(
      `/api/related-posts?title=${encodeURIComponent('A & B')}&url=${encodeURIComponent('/blog/a-b')}&limit=3`,
      expect.any(Function)
    );
  });

  it('skips the request entirely without a title', () => {
    swrState({});
    render(<RelatedPosts currentTitle="" currentUrl="/blog/a" />);
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
  });

  it('shows three skeleton slots while loading', () => {
    swrState({ isLoading: true });
    const { container } = render(<RelatedPosts currentTitle="T" currentUrl="/u" />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  // Error and empty are different states and no longer share an assertion.
  // They used to: both rendered nothing, so a 429 from the rate limiter made
  // the server-rendered section vanish after hydration. The reader saw a
  // heading, looked away, and looked back to nothing — which is worse than
  // content that never arrived, because it reads as the page breaking.
  it('keeps the section and says so when the request fails', () => {
    swrState({ error: new Error('nope') });
    const { container } = render(<RelatedPosts currentTitle="T" currentUrl="/u" />);

    expect(container).not.toBeEmptyDOMElement();
    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
  });

  it('renders nothing when there genuinely are no related essays', () => {
    // Real emptiness needs no placard: an essay with no relatives should not
    // announce that it has none.
    swrState({ data: { data: { related: [] }, success: true } });
    const { container } = render(<RelatedPosts currentTitle="T" currentUrl="/u" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('reads the one API envelope ({ data: { related } })', () => {
    swrState({ data: { data: { related: [post] }, success: true } });
    render(<RelatedPosts currentTitle="T" currentUrl="/u" />);
    expect(screen.getByRole('link', { name: /Strikes Work/ })).toHaveAttribute(
      'href',
      '/blog/strikes-work'
    );
    expect(screen.getByText('Labor history without the amnesia.')).toBeInTheDocument();
  });
});
