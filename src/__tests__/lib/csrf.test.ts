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

// Set an env var for the duration of fn and restore it afterwards. Deletes the
// key when it was originally unset, so we never leave the literal string
// "undefined" behind for later tests (Node coerces `env[x] = undefined`).
function withEnv(name: string, value: string, fn: () => void) {
  const had = Object.prototype.hasOwnProperty.call(process.env, name);
  const prev = process.env[name];
  process.env[name] = value;
  try {
    fn();
  } finally {
    if (had) process.env[name] = prev as string;
    else delete process.env[name];
  }
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
    it('rejects a look-alike *.vercel.app origin that merely starts with the project name', () => {
      // An attacker can claim `lscaturchio-evil.vercel.app` on Vercel's global
      // namespace. A prefix match must not treat it as a trusted deployment.
      const request = createMockRequest('POST', {
        origin: 'https://lscaturchio-evil.vercel.app',
      });
      const result = validateCsrf(request);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });

    it('rejects an unrelated *.vercel.app origin not in any env var', () => {
      const request = createMockRequest('POST', {
        origin: 'https://totally-unrelated.vercel.app',
      });
      const result = validateCsrf(request);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });

    it('allows the deployment URL from VERCEL_URL (host not name-prefixed)', () => {
      // Host does NOT start with the project name, so the old prefix regex
      // would have rejected it — this proves the allowlist comes from the env
      // var, not from a name match.
      withEnv('VERCEL_URL', 'deploy-7x9q2-team.vercel.app', () => {
        const request = createMockRequest('POST', {
          origin: 'https://deploy-7x9q2-team.vercel.app',
        });
        expect(validateCsrf(request)).toBeNull();
      });
    });

    it('allows the branch alias from VERCEL_BRANCH_URL (host not name-prefixed)', () => {
      withEnv('VERCEL_BRANCH_URL', 'feature-login-x9.vercel.app', () => {
        const request = createMockRequest('POST', {
          origin: 'https://feature-login-x9.vercel.app',
        });
        expect(validateCsrf(request)).toBeNull();
      });
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
