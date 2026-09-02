import { describe, expect, it } from 'vitest';

import { classifyFailure, EXIT_BLOCKED } from '../../../scripts/check-uptime.mjs';

const headers = (init: Record<string, string> = {}) => new Headers(init);

/**
 * The distinction these tests pin down is the whole point of the probe:
 * "the edge refused to let us ask" must never be reported as "the site is down".
 * Six false outage issues were filed in two days before it existed.
 */
describe('classifyFailure', () => {
  it('calls a 5xx down even when it looks edge-ish', () => {
    expect(
      classifyFailure({ status: 500, headers: headers({ server: 'cloudflare' }), bodyText: '' })
    ).toBe('down');
    expect(classifyFailure({ status: 502, headers: headers(), bodyText: '' })).toBe('down');
  });

  it('calls a bare 403 from the edge blocked', () => {
    // What the GitHub runner actually got: no Vercel routing headers at all.
    expect(
      classifyFailure({ status: 403, headers: headers({ server: 'cloudflare', 'cf-ray': 'abc' }), bodyText: '' })
    ).toBe('blocked');
  });

  it('trusts cf-mitigated over everything else', () => {
    expect(
      classifyFailure({
        status: 403,
        headers: headers({ 'cf-mitigated': 'challenge', 'x-matched-path': '/' }),
        bodyText: '',
      })
    ).toBe('blocked');
  });

  it('recognises a Cloudflare block page by its body', () => {
    expect(
      classifyFailure({
        status: 403,
        headers: headers(),
        bodyText: '<html><h1>Sorry, you have been blocked</h1>Cloudflare Ray ID: 8f2</html>',
      })
    ).toBe('blocked');
  });

  it('calls a 403 that reached our deployment down, not blocked', () => {
    // x-matched-path proves Vercel routed it, so the app itself refused.
    expect(
      classifyFailure({
        status: 403,
        headers: headers({ 'x-matched-path': '/api/health', 'x-vercel-id': 'sfo1::abc' }),
        bodyText: '{"error":"Forbidden"}',
      })
    ).toBe('down');
  });

  it('treats our own rate limiter (429 from the origin) as down', () => {
    expect(
      classifyFailure({
        status: 429,
        headers: headers({ 'x-vercel-id': 'iad1::abc', 'retry-after': '30' }),
        bodyText: '{"error":"Too many requests"}',
      })
    ).toBe('down');
  });

  it('treats an edge 429 as blocked', () => {
    expect(classifyFailure({ status: 429, headers: headers(), bodyText: '' })).toBe('blocked');
  });

  it('never downgrades a non-refusal status', () => {
    for (const status of [200, 301, 404, 418, 503]) {
      expect(classifyFailure({ status, headers: headers(), bodyText: '' })).toBe('down');
    }
  });

  it('survives a missing headers object', () => {
    expect(classifyFailure({ status: 403, headers: undefined, bodyText: undefined })).toBe('blocked');
    expect(classifyFailure({ status: 500, headers: undefined, bodyText: undefined })).toBe('down');
  });

  it('uses an exit code the workflow can tell apart from a failure', () => {
    expect(EXIT_BLOCKED).toBe(75);
    expect(EXIT_BLOCKED).not.toBe(1);
    expect(EXIT_BLOCKED).not.toBe(0);
  });
});
