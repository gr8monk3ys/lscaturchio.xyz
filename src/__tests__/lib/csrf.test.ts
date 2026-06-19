import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { validateCsrf } from '@/lib/csrf';

// Helper to create mock NextRequest with reliable header access.
// NextRequest strips forbidden headers like 'origin' in test environments,
// so we override headers.get() to return our custom values.
function createMockRequest(
  method: string,
  customHeaders: Record<string, string> = {}
): NextRequest {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(customHeaders)) {
    lower[k.toLowerCase()] = v;
  }
  const req = new NextRequest('http://localhost:3000/api/test', { method });
  const originalGet = req.headers.get.bind(req.headers);
  req.headers.get = (name: string) => lower[name.toLowerCase()] ?? originalGet(name);
  return req;
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

    it('canonicalizes the Origin before comparing (uppercase host)', () => {
      // A non-canonical but equivalent origin (uppercase host) represents the
      // same allowed origin; it should match, like the Referer path which
      // already compares the URL-parsed origin.
      const request = createMockRequest('POST', {
        origin: 'https://LSCATURCHIO.XYZ',
      });
      expect(validateCsrf(request)).toBeNull();
    });

    it('rejects a garbage/opaque Origin value', () => {
      const request = createMockRequest('POST', { origin: 'null' });
      const result = validateCsrf(request);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
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

  describe('Vercel preview deployments', () => {
    it('rejects a look-alike *.vercel.app origin that merely starts with the project name', async () => {
      // An attacker can claim `lscaturchio-evil.vercel.app` on Vercel's global
      // namespace. A prefix match must not treat it as a trusted deployment.
      const request = createMockRequest('POST', {
        origin: 'https://lscaturchio-evil.vercel.app',
      });
      const result = validateCsrf(request);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });

    it('rejects an unrelated *.vercel.app origin', async () => {
      const request = createMockRequest('POST', {
        origin: 'https://totally-unrelated.vercel.app',
      });
      const result = validateCsrf(request);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });

    it('allows the active deployment URL injected via VERCEL_URL', () => {
      const prev = process.env.VERCEL_URL;
      process.env.VERCEL_URL = 'lscaturchio-git-main-team.vercel.app';
      try {
        const request = createMockRequest('POST', {
          origin: 'https://lscaturchio-git-main-team.vercel.app',
        });
        expect(validateCsrf(request)).toBeNull();
      } finally {
        process.env.VERCEL_URL = prev;
      }
    });

    it('allows the stable branch alias injected via VERCEL_BRANCH_URL', () => {
      const prev = process.env.VERCEL_BRANCH_URL;
      process.env.VERCEL_BRANCH_URL = 'lscaturchio-git-feature-team.vercel.app';
      try {
        const request = createMockRequest('POST', {
          origin: 'https://lscaturchio-git-feature-team.vercel.app',
        });
        expect(validateCsrf(request)).toBeNull();
      } finally {
        process.env.VERCEL_BRANCH_URL = prev;
      }
    });
  });

  describe('requests without origin or referer', () => {
    it('rejects POST requests without origin or referer headers', async () => {
      const request = createMockRequest('POST');
      const result = validateCsrf(request);
      expect(result).not.toBeNull();
      const data = await result!.json();
      expect(data.error).toBe('Missing origin header');
      expect(result!.status).toBe(403);
    });

    it('rejects DELETE requests without origin or referer headers', async () => {
      const request = createMockRequest('DELETE');
      const result = validateCsrf(request);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });
  });
});
