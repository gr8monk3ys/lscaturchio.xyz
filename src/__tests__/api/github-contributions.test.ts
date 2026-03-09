import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    STANDARD: { limit: 30, window: 60000 },
  },
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { GET } from '@/app/api/github/contributions/route';
import { logError } from '@/lib/logger';

describe('/api/github/contributions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it('returns a degraded payload when GITHUB_TOKEN is missing', async () => {
    delete process.env.GITHUB_TOKEN;

    const response = await GET(new NextRequest('http://localhost/api/github/contributions'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      totalContributions: 0,
      weeks: [],
      degraded: true,
      message: 'GitHub contribution data is temporarily unavailable.',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns contribution calendar data when GitHub responds successfully', async () => {
    process.env.GITHUB_TOKEN = 'test-token';
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: {
                totalContributions: 12,
                weeks: [
                  {
                    contributionDays: [
                      {
                        contributionCount: 1,
                        date: '2026-03-01',
                        color: '#9be9a8',
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      }),
    });

    const response = await GET(new NextRequest('http://localhost/api/github/contributions'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      totalContributions: 12,
      weeks: [
        {
          contributionDays: [
            {
              contributionCount: 1,
              date: '2026-03-01',
              color: '#9be9a8',
            },
          ],
        },
      ],
      degraded: false,
    });
  });

  it('returns a degraded payload and logs when GitHub fails', async () => {
    process.env.GITHUB_TOKEN = 'test-token';
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const response = await GET(new NextRequest('http://localhost/api/github/contributions'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.degraded).toBe(true);
    expect(data.totalContributions).toBe(0);
    expect(data.weeks).toEqual([]);
    expect(logError).toHaveBeenCalledWith(
      'GitHub Contributions: API error',
      expect.any(Error),
      { component: 'github-contributions', action: 'GET' }
    );
  });
});
