import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
const mockSupabase = {
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => mockSupabase,
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

    // Default: RPC returns subscriber count
    mockSupabase.rpc.mockResolvedValue({ data: 150, error: null });
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
      expect(mockSupabase.rpc).toHaveBeenCalledWith('count_active_subscribers');
    });
  });

  describe('successful responses', () => {
    it('returns subscriber count on success', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 150, error: null });

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeSubscribers).toBe(150);
    });

    it('returns 0 when no subscribers exist', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 0, error: null });

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeSubscribers).toBe(0);
    });

    it('handles null data from RPC', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeSubscribers).toBe(0);
    });

    it('returns large subscriber counts correctly', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 999999, error: null });

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeSubscribers).toBe(999999);
    });
  });

  describe('error handling', () => {
    it('returns 500 on database error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch stats');
      expect(data.activeSubscribers).toBe(0);
    });

    it('returns 500 when RPC throws', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Connection refused'));

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch stats');
      expect(data.activeSubscribers).toBe(0);
    });

    it('logs error when database operation fails', async () => {
      const dbError = new Error('Database error');
      mockSupabase.rpc.mockRejectedValue(dbError);

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

    it('logs error when RPC returns error', async () => {
      const rpcError = { message: 'RPC failed', code: 'PGRST301' };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: rpcError });

      const request = createRequest('valid-api-key');
      await GET(request);

      expect(logError).toHaveBeenCalledWith(
        'Newsletter Stats: Unexpected error',
        rpcError,
        expect.objectContaining({
          component: 'newsletter/stats',
          action: 'GET',
        })
      );
    });

    it('handles timeout errors', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Request timeout'));

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch stats');
    });
  });

  describe('RPC function call', () => {
    it('calls count_active_subscribers RPC', async () => {
      const request = createRequest('valid-api-key');
      await GET(request);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('count_active_subscribers');
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
    });
  });

  describe('response format', () => {
    it('returns JSON content type', async () => {
      const request = createRequest('valid-api-key');
      const response = await GET(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('returns only activeSubscribers field on success', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 100, error: null });

      const request = createRequest('valid-api-key');
      const response = await GET(request);
      const data = await response.json();

      expect(Object.keys(data)).toEqual(['activeSubscribers']);
    });

    it('returns error and activeSubscribers fields on failure', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Error' },
      });

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
      // The handler should be callable (rate limiting is mocked to pass through)
      const request = createRequest('valid-api-key');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });
});
