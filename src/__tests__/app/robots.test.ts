import { describe, it, expect } from 'vitest';

import robots from '@/app/robots';

describe('robots.txt', () => {
  const rule = [robots().rules].flat()[0];
  const list = (value: string | string[] | undefined) => [value ?? []].flat();

  it('keeps the API out of crawlers', () => {
    expect(list(rule.disallow)).toContain('/api/');
  });

  it('lets link-preview crawlers fetch the og:image endpoint', () => {
    // Every page's og:image is /api/og. X's and LinkedIn's preview bots obey
    // robots.txt, so a blanket /api/ disallow left shared links imageless.
    // The longer Allow wins over the shorter Disallow under RFC 9309.
    expect(list(rule.allow)).toContain('/api/og');
  });
});
