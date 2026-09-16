import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockPing = vi.fn();

vi.mock('@upstash/redis', () => ({
  // `new Redis(...)` needs a real function, not an arrow, to be constructible.
  Redis: vi.fn(function () {
    return { ping: mockPing };
  }),
}));

vi.mock('@gr8monk3ys/next-kit/rate-limit', () => ({
  RedisStore: vi.fn(),
  createRateLimiter: vi.fn(),
}));

describe('pingRedis', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // The module caches its Redis client, so every case gets a fresh module.
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.useRealTimers();
  });

  const load = async () => (await import('@/lib/rate-limit-redis')).pingRedis;

  it('reports not-configured without touching the client when no credentials are set', async () => {
    const { Redis } = await import('@upstash/redis');
    const pingRedis = await load();

    await expect(pingRedis()).resolves.toBe('not-configured');
    expect(Redis).not.toHaveBeenCalled();
    expect(mockPing).not.toHaveBeenCalled();
  });

  it('reports connected when the store answers PONG', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    mockPing.mockResolvedValue('PONG');
    const pingRedis = await load();

    await expect(pingRedis()).resolves.toBe('connected');
    expect(mockPing).toHaveBeenCalledTimes(1);
  });

  it('accepts the KV_REST_API_* names Vercel injects', async () => {
    process.env.KV_REST_API_URL = 'https://example.upstash.io';
    process.env.KV_REST_API_TOKEN = 'token';
    mockPing.mockResolvedValue('PONG');
    const pingRedis = await load();

    await expect(pingRedis()).resolves.toBe('connected');
  });

  it('reports unavailable when the store is hibernated (the command throws)', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    // This is the verbatim shape Upstash returns for a hibernated database.
    mockPing.mockRejectedValue(
      new Error('Your database has been temporarily rate-limited. Please activate it from the console.'),
    );
    const pingRedis = await load();

    await expect(pingRedis()).resolves.toBe('unavailable');
  });

  it('reports unavailable when the reply is not PONG', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    mockPing.mockResolvedValue(undefined);
    const pingRedis = await load();

    await expect(pingRedis()).resolves.toBe('unavailable');
  });

  it('reports unavailable when the PING never answers within the timeout', async () => {
    vi.useFakeTimers();
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    mockPing.mockReturnValue(new Promise(() => {}));
    const { pingRedis, REDIS_PING_TIMEOUT_MS } = await import('@/lib/rate-limit-redis');

    const result = pingRedis();
    await vi.advanceTimersByTimeAsync(REDIS_PING_TIMEOUT_MS + 1);

    await expect(result).resolves.toBe('unavailable');
  });

  it('reports unavailable, not a throw, when the client cannot be constructed', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'not a url';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    const { Redis } = await import('@upstash/redis');
    vi.mocked(Redis).mockImplementationOnce(() => {
      throw new TypeError('Invalid URL');
    });
    const pingRedis = await load();

    await expect(pingRedis()).resolves.toBe('unavailable');
  });
});
