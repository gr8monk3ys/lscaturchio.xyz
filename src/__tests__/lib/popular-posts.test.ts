import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSql = vi.fn();

vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
  isDatabaseConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/getAllBlogs', () => ({
  getAllBlogs: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

import { getPopularPosts } from '@/lib/popular-posts';
import { getAllBlogs, type BlogPost } from '@/lib/getAllBlogs';
import { isDatabaseConfigured } from '@/lib/db';

// A whole catalogue record. The catalogue answers published essays only, so
// that is what the double returns.
function post(slug: string, date = '2025-01-01'): BlogPost {
  return {
    slug,
    title: `Title for ${slug}`,
    description: 'desc',
    date,
    tags: ['ai'],
    image: `/images/${slug}.webp`,
    body: '',
    published: true,
    readingTimeMinutes: 1,
    words: 200,
  };
}

describe('getPopularPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
  });

  it('drops view rows whose slug is not a real post', async () => {
    // A high-count row for a slug with no post used to render as a popular
    // post titled with the raw slug, linking to a 404.
    mockSql.mockResolvedValue([
      { slug: 'buy-cheap-stuff', count: 9999 },
      { slug: 'real-post', count: 10 },
    ]);
    vi.mocked(getAllBlogs).mockResolvedValue([post('real-post')]);

    const { source, posts } = await getPopularPosts(5);

    expect(source).toBe('views');
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe('real-post');
    expect(posts[0].title).toBe('Title for real-post');
  });

  it('still returns the requested count when junk rows rank above real posts', async () => {
    // Over-fetching is what makes this work: filtering a LIMIT-n result set
    // would have returned fewer than n posts.
    mockSql.mockResolvedValue([
      { slug: 'junk-a', count: 999 },
      { slug: 'junk-b', count: 998 },
      { slug: 'p1', count: 30 },
      { slug: 'p2', count: 20 },
    ]);
    vi.mocked(getAllBlogs).mockResolvedValue([post('p1'), post('p2')]);

    const { posts } = await getPopularPosts(2);

    expect(posts.map((p) => p.slug)).toEqual(['p1', 'p2']);
  });

  it('falls back to the newest posts when the database is not configured', async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    // Newest first, as the catalogue answers.
    vi.mocked(getAllBlogs).mockResolvedValue([
      post('newer', '2025-06-01'),
      post('older', '2024-01-01'),
    ]);

    const { source, posts } = await getPopularPosts(1);

    expect(source).toBe('fallback');
    expect(posts.map((p) => p.slug)).toEqual(['newer']);
  });
});
