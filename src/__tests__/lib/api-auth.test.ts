import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

import { safeCompare, validateApiKey } from '@/lib/api-auth';
import { logError } from '@/lib/logger';

describe('api-auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('safeCompare', () => {
    it('returns true for identical strings', () => {
      expect(safeCompare('secret123', 'secret123')).toBe(true);
    });

    it('returns false for different strings of same length', () => {
      expect(safeCompare('secret123', 'secret456')).toBe(false);
    });

    it('returns false for strings of different lengths', () => {
      expect(safeCompare('short', 'longer-string')).toBe(false);
    });

    it('returns false when first argument is null', () => {
      expect(safeCompare(null, 'secret123')).toBe(false);
    });

    it('returns false when first argument is empty string', () => {
      expect(safeCompare('', 'secret123')).toBe(false);
    });

    it('handles special characters correctly', () => {
      expect(safeCompare('!@#$%^&*()', '!@#$%^&*()')).toBe(true);
      expect(safeCompare('!@#$%^&*()', '!@#$%^&*()_')).toBe(false);
    });

    it('handles unicode characters correctly', () => {
      expect(safeCompare('\u00e9\u00e8', '\u00e9\u00e8')).toBe(true);
      expect(safeCompare('\u00e9\u00e8', '\u00e9\u00e7')).toBe(false);
    });

    it('uses timing-safe comparison for same-length strings', () => {
      // Spy on crypto.timingSafeEqual to verify it's being used
      const timingSafeEqualSpy = vi.spyOn(crypto, 'timingSafeEqual');

      safeCompare('abc123', 'abc123');

      expect(timingSafeEqualSpy).toHaveBeenCalled();
      timingSafeEqualSpy.mockRestore();
    });

    it('performs constant-time operation even with different lengths', () => {
      // For different lengths, it should still call timingSafeEqual once
      // (comparing bufA with bufA) to maintain constant time
      const timingSafeEqualSpy = vi.spyOn(crypto, 'timingSafeEqual');

      safeCompare('short', 'longer-string');

      // Should be called once for the constant-time operation
      expect(timingSafeEqualSpy).toHaveBeenCalledTimes(1);
      timingSafeEqualSpy.mockRestore();
    });
  });

  describe('validateApiKey', () => {
    function createRequest(apiKey?: string | null): NextRequest {
      const headers: Record<string, string> = {};
      if (apiKey !== undefined && apiKey !== null) {
        headers['x-api-key'] = apiKey;
      }
      return new NextRequest('http://localhost/api/test', {
        method: 'GET',
        headers,
      });
    }

    describe('production mode', () => {
      beforeEach(() => {
        (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
      });

      it('returns 401 when API key env var is not configured', async () => {
        delete process.env.ANALYTICS_API_KEY;

        const request = createRequest('some-key');
        const result = validateApiKey(request);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result!.status).toBe(401);

        const body = await result!.json();
        expect(body.error).toBe('Unauthorized - API key required');
        expect(logError).toHaveBeenCalled();
      });

      it('returns 401 when provided API key is missing', async () => {
        process.env.ANALYTICS_API_KEY = 'valid-api-key';

        const request = createRequest(null);
        const result = validateApiKey(request);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result!.status).toBe(401);

        const body = await result!.json();
        expect(body.error).toBe('Unauthorized - valid API key required');
      });

      it('returns 401 when provided API key is empty string', async () => {
        process.env.ANALYTICS_API_KEY = 'valid-api-key';

        const request = createRequest('');
        const result = validateApiKey(request);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result!.status).toBe(401);

        const body = await result!.json();
        expect(body.error).toBe('Unauthorized - valid API key required');
      });

      it('returns 401 when provided API key is invalid', async () => {
        process.env.ANALYTICS_API_KEY = 'valid-api-key';

        const request = createRequest('wrong-api-key');
        const result = validateApiKey(request);

        expect(result).toBeInstanceOf(NextResponse);
        expect(result!.status).toBe(401);

        const body = await result!.json();
        expect(body.error).toBe('Unauthorized - valid API key required');
      });

      it('returns null (success) when API key is valid', () => {
        process.env.ANALYTICS_API_KEY = 'valid-api-key';

        const request = createRequest('valid-api-key');
        const result = validateApiKey(request);

        expect(result).toBeNull();
      });

      it('uses custom environment variable when specified', () => {
        process.env.CUSTOM_API_KEY = 'custom-secret';

        const request = createRequest('custom-secret');
        const result = validateApiKey(request, { envKey: 'CUSTOM_API_KEY' });

        expect(result).toBeNull();
      });

      it('returns 401 with wrong key for custom env var', async () => {
        process.env.CUSTOM_API_KEY = 'custom-secret';

        const request = createRequest('wrong-secret');
        const result = validateApiKey(request, { envKey: 'CUSTOM_API_KEY' });

        expect(result).toBeInstanceOf(NextResponse);
        expect(result!.status).toBe(401);
      });

      it('logs error with custom component when API key not configured', () => {
        delete process.env.ANALYTICS_API_KEY;

        const request = createRequest('some-key');
        validateApiKey(request, { component: 'custom-component', action: 'custom-action' });

        expect(logError).toHaveBeenCalledWith(
          'ANALYTICS_API_KEY not configured in production',
          null,
          expect.objectContaining({
            component: 'custom-component',
            action: 'custom-action',
          })
        );
      });
    });

    describe('development mode', () => {
      beforeEach(() => {
        (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
      });

      it('allows access when API key env var is not configured', () => {
        delete process.env.ANALYTICS_API_KEY;

        const request = createRequest();
        const result = validateApiKey(request);

        expect(result).toBeNull();
      });

      it('allows access when API key env var is empty', () => {
        process.env.ANALYTICS_API_KEY = '';

        const request = createRequest();
        const result = validateApiKey(request);

        expect(result).toBeNull();
      });

      it('still validates when API key is configured', async () => {
        process.env.ANALYTICS_API_KEY = 'dev-api-key';

        // Valid key should work
        const validRequest = createRequest('dev-api-key');
        expect(validateApiKey(validRequest)).toBeNull();

        // Invalid key should fail
        const invalidRequest = createRequest('wrong-key');
        const result = validateApiKey(invalidRequest);
        expect(result).toBeInstanceOf(NextResponse);
        expect(result!.status).toBe(401);
      });

      it('does not log error when API key not configured in dev', () => {
        delete process.env.ANALYTICS_API_KEY;

        const request = createRequest();
        validateApiKey(request);

        expect(logError).not.toHaveBeenCalled();
      });
    });

    describe('test mode', () => {
      beforeEach(() => {
        (process.env as { NODE_ENV: string }).NODE_ENV = 'test';
      });

      it('allows access when API key env var is not configured', () => {
        delete process.env.ANALYTICS_API_KEY;

        const request = createRequest();
        const result = validateApiKey(request);

        // Test mode is not 'production', so it should allow access
        expect(result).toBeNull();
      });
    });

    describe('timing attack resistance', () => {
      it('processes valid and invalid keys in similar time', () => {
        (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
        process.env.ANALYTICS_API_KEY = 'a'.repeat(64);

        // Measure time for valid key
        const validRequest = createRequest('a'.repeat(64));
        const validStart = performance.now();
        validateApiKey(validRequest);
        const validTime = performance.now() - validStart;

        // Measure time for invalid key (same length)
        const invalidRequest = createRequest('b'.repeat(64));
        const invalidStart = performance.now();
        validateApiKey(invalidRequest);
        const invalidTime = performance.now() - invalidStart;

        // Times should be within reasonable range of each other
        // Note: This is a basic check - real timing attacks require statistical analysis
        const timeDiff = Math.abs(validTime - invalidTime);
        expect(timeDiff).toBeLessThan(10); // Less than 10ms difference
      });
    });

    describe('options parameter', () => {
      beforeEach(() => {
        (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
      });

      it('uses default options when none provided', () => {
        delete process.env.ANALYTICS_API_KEY;

        const request = createRequest('key');
        validateApiKey(request);

        expect(logError).toHaveBeenCalledWith(
          'ANALYTICS_API_KEY not configured in production',
          null,
          expect.objectContaining({
            component: 'api',
            action: 'validateApiKey',
          })
        );
      });

      it('uses partial custom options', () => {
        delete process.env.ANALYTICS_API_KEY;

        const request = createRequest('key');
        validateApiKey(request, { component: 'analytics' });

        expect(logError).toHaveBeenCalledWith(
          'ANALYTICS_API_KEY not configured in production',
          null,
          expect.objectContaining({
            component: 'analytics',
            action: 'validateApiKey',
          })
        );
      });
    });
  });
});
