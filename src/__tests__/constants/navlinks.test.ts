import { describe, it, expect } from 'vitest';
import { primaryNavigation } from '@/constants/navlinks';

describe('primaryNavigation', () => {
  it('surfaces the garden at the top level', () => {
    expect(primaryNavigation.map((i) => i.name)).toContain('Garden');
  });

  it('no longer shouts Work With Me', () => {
    const names = primaryNavigation.map((i) => i.name);
    expect(names).not.toContain('Work With Me');
    expect(names).toContain('Hire me');
  });
});
