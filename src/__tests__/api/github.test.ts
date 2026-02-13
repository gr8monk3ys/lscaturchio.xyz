import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { GET } from '@/app/api/github/route';

const mockRepos = [
  {
    name: 'awesome-project',
    description: 'An awesome project',
    html_url: 'https://github.com/gr8monk3ys/awesome-project',
    language: 'TypeScript',
    stargazers_count: 100,
    forks_count: 25,
    updated_at: '2024-01-15T10:00:00Z',
    fork: false,
  },
  {
    name: 'another-repo',
    description: null,
    html_url: 'https://github.com/gr8monk3ys/another-repo',
    language: 'Python',
    stargazers_count: 50,
    forks_count: 10,
    updated_at: '2024-01-10T08:00:00Z',
    fork: false,
  },
  {
    name: 'forked-repo',
    description: 'A forked repo',
    html_url: 'https://github.com/gr8monk3ys/forked-repo',
    language: 'JavaScript',
    stargazers_count: 200,
    forks_count: 50,
    updated_at: '2024-01-14T12:00:00Z',
    fork: true, // This should be filtered out
  },
];

const mockTopics = {
  'awesome-project': { names: ['web', 'typescript', 'nextjs'] },
  'another-repo': { names: ['data-science', 'ml'] },
};

describe('GitHub API Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GET /api/github', () => {
    it('returns transformed repos sorted by stars', async () => {
      // Mock repos request
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://api.github.com/users/gr8monk3ys/repos') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRepos),
            headers: new Headers(),
          });
        }
        // Mock topics requests
        if (url.includes('/topics')) {
          const repoName = url.split('/repos/gr8monk3ys/')[1].split('/')[0];
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTopics[repoName as keyof typeof mockTopics] || { names: [] }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const request = new NextRequest('http://localhost/api/github');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      // Forked repos should be filtered out
      expect(data.length).toBe(2);
      // Should be sorted by stars (descending)
      expect(data[0].stars).toBe(100);
      expect(data[1].stars).toBe(50);
    });

    it('transforms repos with correct fields', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://api.github.com/users/gr8monk3ys/repos') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mockRepos[0]]),
            headers: new Headers(),
          });
        }
        if (url.includes('/topics')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ names: ['web', 'typescript'] }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const request = new NextRequest('http://localhost/api/github');
      const response = await GET(request);
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
      // Stack should include language and topics
      expect(data[0].stack).toContain('TypeScript');
      expect(data[0].stack).toContain('web');
      expect(data[0].stack).toContain('typescript');
    });

    it('uses "No description available" for null description', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://api.github.com/users/gr8monk3ys/repos') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mockRepos[1]]), // another-repo has null description
            headers: new Headers(),
          });
        }
        if (url.includes('/topics')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ names: [] }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const request = new NextRequest('http://localhost/api/github');
      const response = await GET(request);
      const data = await response.json();

      expect(data[0].description).toBe('No description available');
      expect(data[0].logo).toBe('/images/projects/logos/another-repo.svg');
    });

    it('filters out forked repositories', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://api.github.com/users/gr8monk3ys/repos') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRepos),
            headers: new Headers(),
          });
        }
        if (url.includes('/topics')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ names: [] }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const request = new NextRequest('http://localhost/api/github');
      const response = await GET(request);
      const data = await response.json();

      // The forked-repo should not be in the results
      const repoNames = data.map((r: { title: string }) => r.title);
      expect(repoNames).not.toContain('forked-repo');
    });

    it('sends correct Accept header to GitHub API', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://api.github.com/users/gr8monk3ys/repos') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mockRepos[0]]),
            headers: new Headers(),
          });
        }
        if (url.includes('/topics')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ names: [] }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const request = new NextRequest('http://localhost/api/github');
      await GET(request);

      // Check that the correct Accept header was included for repos
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/gr8monk3ys/repos',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/vnd.github.v3+json',
          }),
        })
      );
    });

    it('returns 500 with error on GitHub API failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ 'X-RateLimit-Remaining': '10' }),
      });

      const request = new NextRequest('http://localhost/api/github');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch repositories');
      // Note: Implementation doesn't include 'repos' field on error
    });

    it('returns general error when GitHub rate limit exceeded', async () => {
      // Note: Implementation doesn't distinguish rate limit errors from other failures
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ 'X-RateLimit-Remaining': '0' }),
      });

      const request = new NextRequest('http://localhost/api/github');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch repositories');
    });

    it('handles empty topics gracefully', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://api.github.com/users/gr8monk3ys/repos') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mockRepos[0]]),
            headers: new Headers(),
          });
        }
        if (url.includes('/topics')) {
          return Promise.resolve({
            ok: false, // Topics endpoint fails
            status: 404,
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const request = new NextRequest('http://localhost/api/github');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Stack should still have the language even without topics
      expect(data[0].stack).toContain('TypeScript');
    });

    it('handles repos with no language', async () => {
      const repoWithNoLang = {
        ...mockRepos[0],
        language: null,
      };

      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://api.github.com/users/gr8monk3ys/repos') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([repoWithNoLang]),
            headers: new Headers(),
          });
        }
        if (url.includes('/topics')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ names: ['topic1'] }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const request = new NextRequest('http://localhost/api/github');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Stack should filter out null language
      expect(data[0].stack).not.toContain(null);
      expect(data[0].stack).toContain('topic1');
    });
  });
});
