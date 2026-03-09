import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockSql, mockIsDatabaseConfigured } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockIsDatabaseConfigured: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
  isDatabaseConfigured: mockIsDatabaseConfigured,
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    PUBLIC: { limit: 100, window: 60000 },
  },
}));

import { GET } from '@/app/api/newsletter/stats/route';
import { logError } from '@/lib/logger';

describe('/api/newsletter/stats', () => {
  function createRequest(): NextRequest {
    return new NextRequest('http://localhost/api/newsletter/stats', {
      method: 'GET',
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDatabaseConfigured.mockReturnValue(true);
    mockSql.mockResolvedValue([{ count_active_subscribers: 150 }]);
  });

  it('returns a public unavailable state when the database is not configured', async () => {
    mockIsDatabaseConfigured.mockReturnValue(false);

    const response = await GET(createRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      activeSubscribers: null,
      available: false,
      message: 'Newsletter subscriber counts are unavailable right now.',
    });
  });

  it('returns subscriber counts when available', async () => {
    const response = await GET(createRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      activeSubscribers: 150,
      available: true,
    });
  });

  it('normalizes missing counts to zero', async () => {
    mockSql.mockResolvedValue([{ count_active_subscribers: null }]);

    const response = await GET(createRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      activeSubscribers: 0,
      available: true,
    });
  });

  it('returns an unavailable state on database errors', async () => {
    mockSql.mockRejectedValue(new Error('Database error'));

    const response = await GET(createRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch stats',
      activeSubscribers: null,
      available: false,
      message: 'Newsletter subscriber counts are unavailable right now.',
    });
  });

  it('logs unexpected errors', async () => {
    const dbError = new Error('Database error');
    mockSql.mockRejectedValue(dbError);

    await GET(createRequest());

    expect(logError).toHaveBeenCalledWith(
      'Newsletter Stats: Unexpected error',
      dbError,
      expect.objectContaining({
        component: 'newsletter/stats',
        action: 'GET',
      })
    );
  });
});
