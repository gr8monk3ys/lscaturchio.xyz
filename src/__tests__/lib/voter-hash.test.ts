import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Store original env
const originalEnv = process.env;

// Helper to create mock NextRequest with headers
function createMockRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/test', {
    method: 'POST',
    headers,
  });
}

describe('voter-hash', () => {
  beforeEach(() => {
    // Reset modules to get fresh imports with new env vars
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Note: isVoterHashConfigured was removed from the module
  // The module now always uses a default salt if VOTER_HASH_SALT is not set
  describe('salt behavior', () => {
    it('uses custom salt when VOTER_HASH_SALT is set', async () => {
      process.env.VOTER_HASH_SALT = 'custom-salt';
      const { getVoterHash } = await import('@/lib/voter-hash');
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });
      const hash = getVoterHash(request);
      expect(hash).toHaveLength(32);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('uses default salt when VOTER_HASH_SALT is not set', async () => {
      delete process.env.VOTER_HASH_SALT;
      const { getVoterHash } = await import('@/lib/voter-hash');
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });
      const hash = getVoterHash(request);
      expect(hash).toHaveLength(32);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('uses default salt when VOTER_HASH_SALT is empty string', async () => {
      process.env.VOTER_HASH_SALT = '';
      const { getVoterHash } = await import('@/lib/voter-hash');
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });
      const hash = getVoterHash(request);
      expect(hash).toHaveLength(32);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('isVoteDeduplicationEnabled', () => {
    it('returns true by default', async () => {
      delete process.env.DISABLE_VOTE_DEDUPLICATION;
      const { isVoteDeduplicationEnabled } = await import('@/lib/voter-hash');
      expect(isVoteDeduplicationEnabled()).toBe(true);
    });

    it('returns false when DISABLE_VOTE_DEDUPLICATION is true', async () => {
      process.env.DISABLE_VOTE_DEDUPLICATION = 'true';
      const { isVoteDeduplicationEnabled } = await import('@/lib/voter-hash');
      expect(isVoteDeduplicationEnabled()).toBe(false);
    });

    it('returns true when DISABLE_VOTE_DEDUPLICATION is false', async () => {
      process.env.DISABLE_VOTE_DEDUPLICATION = 'false';
      const { isVoteDeduplicationEnabled } = await import('@/lib/voter-hash');
      expect(isVoteDeduplicationEnabled()).toBe(true);
    });

    it('returns true when DISABLE_VOTE_DEDUPLICATION has other value', async () => {
      process.env.DISABLE_VOTE_DEDUPLICATION = 'yes';
      const { isVoteDeduplicationEnabled } = await import('@/lib/voter-hash');
      expect(isVoteDeduplicationEnabled()).toBe(true);
    });
  });

  describe('getVoterHash', () => {
    describe('with salt configured', () => {
      it('returns consistent hash for same IP', async () => {
        process.env.VOTER_HASH_SALT = 'test-salt-123';
        const { getVoterHash } = await import('@/lib/voter-hash');

        const request1 = createMockRequest({ 'x-real-ip': '192.168.1.1' });
        const request2 = createMockRequest({ 'x-real-ip': '192.168.1.1' });

        const hash1 = getVoterHash(request1);
        const hash2 = getVoterHash(request2);

        expect(hash1).toBe(hash2);
      });

      it('returns different hashes for different IPs', async () => {
        process.env.VOTER_HASH_SALT = 'test-salt-123';
        const { getVoterHash } = await import('@/lib/voter-hash');

        const request1 = createMockRequest({ 'x-real-ip': '192.168.1.1' });
        const request2 = createMockRequest({ 'x-real-ip': '192.168.1.2' });

        const hash1 = getVoterHash(request1);
        const hash2 = getVoterHash(request2);

        expect(hash1).not.toBe(hash2);
      });

      it('returns 32 character hash', async () => {
        process.env.VOTER_HASH_SALT = 'test-salt-123';
        const { getVoterHash } = await import('@/lib/voter-hash');

        const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });
        const hash = getVoterHash(request);

        expect(hash).toHaveLength(32);
        expect(hash).toMatch(/^[a-f0-9]+$/);
      });

      it('uses cf-connecting-ip header first (Cloudflare)', async () => {
        process.env.VOTER_HASH_SALT = 'test-salt-123';
        const { getVoterHash } = await import('@/lib/voter-hash');

        const request = createMockRequest({
          'cf-connecting-ip': '1.2.3.4',
          'x-real-ip': '5.6.7.8',
          'x-forwarded-for': '9.10.11.12',
        });

        const cfOnlyRequest = createMockRequest({
          'cf-connecting-ip': '1.2.3.4',
        });

        expect(getVoterHash(request)).toBe(getVoterHash(cfOnlyRequest));
      });

      it('uses x-real-ip header when cf-connecting-ip not present', async () => {
        process.env.VOTER_HASH_SALT = 'test-salt-123';
        const { getVoterHash } = await import('@/lib/voter-hash');

        const request = createMockRequest({
          'x-real-ip': '5.6.7.8',
          'x-forwarded-for': '9.10.11.12',
        });

        const realIpOnlyRequest = createMockRequest({
          'x-real-ip': '5.6.7.8',
        });

        expect(getVoterHash(request)).toBe(getVoterHash(realIpOnlyRequest));
      });

      it('uses first IP from x-forwarded-for when others not present', async () => {
        process.env.VOTER_HASH_SALT = 'test-salt-123';
        const { getVoterHash } = await import('@/lib/voter-hash');

        const request = createMockRequest({
          'x-forwarded-for': '9.10.11.12, 13.14.15.16, 17.18.19.20',
        });

        const singleIpRequest = createMockRequest({
          'x-forwarded-for': '9.10.11.12',
        });

        expect(getVoterHash(request)).toBe(getVoterHash(singleIpRequest));
      });

      it('falls back to localhost when no IP headers present', async () => {
        process.env.VOTER_HASH_SALT = 'test-salt-123';
        const { getVoterHash } = await import('@/lib/voter-hash');

        const request1 = createMockRequest({});
        const request2 = createMockRequest({});

        // Both should get localhost, so hashes should match
        expect(getVoterHash(request1)).toBe(getVoterHash(request2));
      });
    });

    describe('without custom salt configured', () => {
      // Note: The implementation now uses a default salt, so behavior is deterministic
      it('returns consistent hash when using default salt', async () => {
        delete process.env.VOTER_HASH_SALT;
        (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
        const { getVoterHash } = await import('@/lib/voter-hash');

        const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

        const hash1 = getVoterHash(request);
        const hash2 = getVoterHash(request);

        // With default salt, same IP should produce same hash
        expect(hash1).toBe(hash2);
      });

      it('returns 32 character hex string with default salt', async () => {
        delete process.env.VOTER_HASH_SALT;
        (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
        const { getVoterHash } = await import('@/lib/voter-hash');

        const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });
        const hash = getVoterHash(request);

        expect(hash).toHaveLength(32);
        expect(hash).toMatch(/^[a-f0-9]+$/);
      });
    });
  });
});
