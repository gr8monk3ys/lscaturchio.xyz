import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchJson, HttpError } from '@/lib/fetcher';

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number; contentType?: string } = {}) {
  const { ok = true, status = 200, contentType = 'application/json' } = init;
  return {
    ok,
    status,
    headers: { get: (name: string) => (name === 'content-type' ? contentType : null) },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchJson', () => {
  it('returns the parsed JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ hello: 'world' })));
    await expect(fetchJson('/api/x')).resolves.toEqual({ hello: 'world' });
  });

  it('throws HttpError carrying the API error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ error: 'rate limited' }, { ok: false, status: 429 }))
    );
    const err = (await fetchJson('/api/x').catch((e) => e)) as HttpError;
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(429);
    expect(err.message).toBe('rate limited');
    expect(err.payload).toEqual({ error: 'rate limited' });
  });

  it('falls back to a status message when the error body has no error field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ nope: true }, { ok: false, status: 500 }))
    );
    await expect(fetchJson('/api/x')).rejects.toThrow('Request failed with status 500');
  });

  it('parses JSON out of text bodies without a JSON content type', async () => {
    const response = {
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      json: () => Promise.resolve(null),
      text: () => Promise.resolve('{"a":1}'),
    } as unknown as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    await expect(fetchJson('/api/x')).resolves.toEqual({ a: 1 });
  });

  it('returns raw text when the body is not JSON', async () => {
    const response = {
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      json: () => Promise.resolve(null),
      text: () => Promise.resolve('just words'),
    } as unknown as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    await expect(fetchJson('/api/x')).resolves.toBe('just words');
  });

  it('tolerates test doubles that only implement json()', async () => {
    const response = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ minimal: true }),
    } as unknown as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    await expect(fetchJson('/api/x')).resolves.toEqual({ minimal: true });
  });
});
