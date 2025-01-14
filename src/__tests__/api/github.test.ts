import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock rate limiting to pass through for tests
vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
  RATE_LIMITS: {
    STANDARD: { limit: 60, window: 60000 },
    PUBLIC: { limit: 100, window: 60000 },
    AI_HEAVY: { limit: 5, window: 60000 },
  },
}));

// Mock the shared github-repos helper
const mockGetGithubPortfolioRepos = vi.fn();
vi.mock('@/lib/github-repos', () => ({
  getGithubPortfolioRepos: (...args: unknown[]) => mockGetGithubPortfolioRepos(...args),
}));

import { GET } from '@/app/api/github/route';

function createMockRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/github');
}

const mockPortfolioRepos = [
  {
    title: 'awesome-project',
    description: 'An awesome project',
    href: 'https://github.com/gr8monk3ys/awesome-project',
    slug: 'awesome-project',
    stack: ['TypeScript', 'web', 'typescript', 'nextjs'],
    stars: 100,
    forks: 25,
    lastUpdated: '1/15/2024',
    logo: '/images/projects/logos/awesome-project.svg',
  },
  {
    title: 'another-repo',
    description: 'No description available',
    href: 'https://github.com/gr8monk3ys/another-repo',
    slug: 'another-repo',
    stack: ['Python', 'data-science', 'ml'],
    stars: 50,
    forks: 10,
    lastUpdated: '1/10/2024',
    logo: '/images/projects/logos/another-repo.svg',
  },
];

describe('GitHub API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/github', () => {
    it('returns repos sorted by stars', async () => {
      mockGetGithubPortfolioRepos.mockResolvedValue(mockPortfolioRepos);

      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
      // Should be sorted by stars (descending) - already sorted by the shared helper
      expect(data[0].stars).toBe(100);
      expect(data[1].stars).toBe(50);
    });

    it('returns repos with correct fields', async () => {
      mockGetGithubPortfolioRepos.mockResolvedValue([mockPortfolioRepos[0]]);

      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(data[0]).toMatchObject({
        title: 'awesome-project',
        description: 'An awesome project',
        href: 'https://github.com/gr8monk3ys/awesome-project',
        slug: 'awesome-project',
        stars: 100,
        forks: 25,
        logo: '/images/projects/logos/awesome-project.svg',
      });
      expect(data[0].stack).toContain('TypeScript');
      expect(data[0].stack).toContain('web');
      expect(data[0].stack).toContain('typescript');
    });

    it('returns Cache-Control header', async () => {
      mockGetGithubPortfolioRepos.mockResolvedValue(mockPortfolioRepos);

      const response = await GET(createMockRequest());

      expect(response.headers.get('Cache-Control')).toBe(
        'public, s-maxage=3600, stale-while-revalidate=7200'
      );
    });

    it('returns 500 with error on failure', async () => {
      mockGetGithubPortfolioRepos.mockRejectedValue(new Error('GitHub API error'));

      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch repositories');
    });

    it('returns empty array when no repos found', async () => {
      mockGetGithubPortfolioRepos.mockResolvedValue([]);

      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });
});
