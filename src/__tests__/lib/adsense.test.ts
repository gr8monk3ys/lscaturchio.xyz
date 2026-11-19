import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { ADSENSE_PUBLISHER_ID } from '@/lib/adsense';

describe('AdSense root verification', () => {
  it('ads.txt authorises the publisher the verification tag names', () => {
    const publisher = ADSENSE_PUBLISHER_ID.replace('ca-', '');
    expect(readFileSync('public/ads.txt', 'utf8').trim()).toBe(
      `google.com, ${publisher}, DIRECT, f08c47fec0942fa0`,
    );
  });
});
