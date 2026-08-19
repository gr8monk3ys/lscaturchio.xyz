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

  it('renders nothing on error or empty results', () => {
    swrState({ error: new Error('nope') });
    const { container } = render(<RelatedPosts currentTitle="T" currentUrl="/u" />);
    expect(container).toBeEmptyDOMElement();

    swrState({ data: { related: [] } });
    const { container: empty } = render(<RelatedPosts currentTitle="T" currentUrl="/u" />);
    expect(empty).toBeEmptyDOMElement();
  });

  it('unwraps the enveloped API shape ({ data: { related } })', () => {
    swrState({ data: { data: { related: [post] } } });
    render(<RelatedPosts currentTitle="T" currentUrl="/u" />);
    expect(screen.getByRole('link', { name: /Strikes Work/ })).toHaveAttribute(
      'href',
      '/blog/strikes-work'
    );
  });

  it('accepts the bare shape ({ related }) too', () => {
    swrState({ data: { related: [post] } });
    render(<RelatedPosts currentTitle="T" currentUrl="/u" />);
    expect(screen.getByText('Labor history without the amnesia.')).toBeInTheDocument();
  });
});
