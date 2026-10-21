import { describe, it, expect } from 'vitest';
import { IDENTITY } from '@/constants/identity';

describe('IDENTITY', () => {
  it('no longer describes Lorenzo with a job title', () => {
    expect(IDENTITY.role).not.toContain('AI Engineer');
    expect(IDENTITY.titleDefault).not.toContain('AI Engineer & Essayist');
  });

  it('uses the agreed self-description', () => {
    expect(IDENTITY.role).toBe('builds AI that shows its sources');
    expect(IDENTITY.titleDefault).toBe(
      'Lorenzo Scaturchio — builds AI that shows its sources'
    );
  });

  it('leads the tagline with the writing', () => {
    expect(IDENTITY.tagline).toMatch(/writes about/i);
  });
});
