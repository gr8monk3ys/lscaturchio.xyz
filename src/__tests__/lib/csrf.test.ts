import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { validateCsrf } from '@/lib/csrf';

// Helper to create mock NextRequest
function createMockRequest(
  method: string,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest('http://localhost:3000/api/test', {
    method,
    headers,
  });
}

describe('validateCsrf', () => {
  describe('safe methods are always allowed', () => {
    it('allows GET requests without origin header', () => {
      const request = createMockRequest('GET');
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });

    it('allows HEAD requests without origin header', () => {
      const request = createMockRequest('HEAD');
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });

    it('allows OPTIONS requests without origin header', () => {
      const request = createMockRequest('OPTIONS');
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });
  });

  describe('allowed origins', () => {
    it('allows POST requests with valid localhost origin', () => {
      const request = createMockRequest('POST', {
        origin: 'http://localhost:3000',
      });
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });

    it('allows POST requests with 127.0.0.1 origin', () => {
      const request = createMockRequest('POST', {
        origin: 'http://127.0.0.1:3000',
      });
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });

    it('allows POST requests with production origin', () => {
      const request = createMockRequest('POST', {
        origin: 'https://lscaturchio.xyz',
      });
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });

    it('allows POST requests with www production origin', () => {
      const request = createMockRequest('POST', {
        origin: 'https://www.lscaturchio.xyz',
      });
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });

    it('allows DELETE requests with valid origin', () => {
      const request = createMockRequest('DELETE', {
        origin: 'https://lscaturchio.xyz',
      });
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });
  });

  describe('referer fallback', () => {
    it('allows requests with valid localhost referer when no origin', () => {
      const request = createMockRequest('POST', {
        referer: 'http://localhost:3000/blog/post',
      });
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });

    it('allows requests with valid production referer when no origin', () => {
      const request = createMockRequest('POST', {
        referer: 'https://lscaturchio.xyz/blog/post',
      });
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });
  });

  describe('requests without origin or referer', () => {
    // The CSRF implementation allows requests without origin/referer
    // for API flexibility (curl, same-origin requests, etc.)
    it('allows POST requests without origin or referer headers', () => {
      const request = createMockRequest('POST');
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });

    it('allows DELETE requests without origin or referer headers', () => {
      const request = createMockRequest('DELETE');
      const result = validateCsrf(request);
      expect(result).toBeNull();
    });
  });
});
