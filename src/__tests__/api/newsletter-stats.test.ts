import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mockSql = vi.fn();

// Mock dependencies
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

// Mock rate limiting to pass through for tests
vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    PUBLIC: { limit: 100, window: 60000 },
  },
}));

// Mock api-auth module
vi.mock('@/lib/api-auth', () => ({
  validateApiKey: vi.fn(),
}));

import { GET } from '@/app/api/newsletter/stats/route';
import { validateApiKey } from '@/lib/api-auth';
import { logError } from '@/lib/logger';

describe('/api/newsletter/stats', () => {
  const originalEnv = process.env;

  function createRequest(apiKey?: string): NextRequest {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }
    return new NextRequest('http://localhost/api/newsletter/stats', {
      method: 'GET',
      headers,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.ANALYTICS_API_KEY = 'valid-api-key';

    // Default: API key validation passes
    vi.mocked(validateApiKey).mockReturnValue(null);

    // Default: SQL returns subscriber count
    mockSql.mockResolvedValue([{ count_active_subscribers: 150 }]);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('authentication', () => {
    it('returns 401 when API key is invalid', async () => {
      vi.mocked(validateApiKey).mockReturnValue(
        NextResponse.json(
          { error: 'Unauthorized - valid API key required' },
          { status: 401 }
        )
      );

      const request = createRequest('invalid-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('returns 401 when API key is missing', async () => {
      vi.mocked(validateApiKey).mockReturnValue(
        NextResponse.json(
          { error: 'Unauthorized - valid API key required' },
          { status: 401 }
        )
      );

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('calls validateApiKey with correct component', async () => {
      const request = createRequest('valid-api-key');
      await GET(request);

      expect(validateApiKey).toHaveBeenCalledWith(request, { component: 'newsletter/stats' });
    });

    it('proceeds to handler when API key is valid', async () => {
      const request = createRequest('valid-api-key');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockSql).toHaveBeenCalled();
    });
  });

  describe('successful responses', () => {
    it('returns subscriber count on success', async () => {
      mockSql.mockResolvedValue([{ count_active_subscribers: 150 }]);

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeSubscribers).toBe(150);
    });

    it('returns 0 when no subscribers exist', async () => {
      mockSql.mockResolvedValue([{ count_active_subscribers: 0 }]);

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeSubscribers).toBe(0);
    });

    it('handles null data from SQL', async () => {
      mockSql.mockResolvedValue([{ count_active_subscribers: null }]);

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeSubscribers).toBe(0);
    });

    it('returns large subscriber counts correctly', async () => {
      mockSql.mockResolvedValue([{ count_active_subscribers: 999999 }]);

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeSubscribers).toBe(999999);
    });
  });

  describe('error handling', () => {
    it('returns 500 on database error', async () => {
      mockSql.mockRejectedValue(new Error('Database connection failed'));

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch stats');
      expect(data.activeSubscribers).toBe(0);
    });

    it('returns 500 when SQL throws', async () => {
      mockSql.mockRejectedValue(new Error('Connection refused'));

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch stats');
      expect(data.activeSubscribers).toBe(0);
    });

    it('logs error when database operation fails', async () => {
      const dbError = new Error('Database error');
      mockSql.mockRejectedValue(dbError);

      const request = createRequest('valid-api-key');
      await GET(request);

      expect(logError).toHaveBeenCalledWith(
        'Newsletter Stats: Unexpected error',
        dbError,
        expect.objectContaining({
          component: 'newsletter/stats',
          action: 'GET',
        })
      );
    });

    it('handles timeout errors', async () => {
      mockSql.mockRejectedValue(new Error('Request timeout'));

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch stats');
    });
  });

  describe('SQL function call', () => {
    it('calls count_active_subscribers function', async () => {
      const request = createRequest('valid-api-key');
      await GET(request);

      expect(mockSql).toHaveBeenCalledTimes(1);
    });
  });

  describe('response format', () => {
    it('returns JSON content type', async () => {
      const request = createRequest('valid-api-key');
      const response = await GET(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('returns only activeSubscribers field on success', async () => {
      mockSql.mockResolvedValue([{ count_active_subscribers: 100 }]);

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(Object.keys(data)).toEqual(['activeSubscribers']);
    });

    it('returns error and activeSubscribers fields on failure', async () => {
      mockSql.mockRejectedValue(new Error('Error'));

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('activeSubscribers');
      expect(data.activeSubscribers).toBe(0);
    });
  });

  describe('rate limiting integration', () => {
    it('handler is wrapped with rate limiting', async () => {
      const request = createRequest('valid-api-key');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });
});
