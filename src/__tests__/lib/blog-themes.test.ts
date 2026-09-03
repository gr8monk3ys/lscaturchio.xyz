import { describe, it, expect } from 'vitest';
import {
  BLOG_THEMES,
  FALLBACK_THEME_SLUG,
  themeForTags,
  groupByTheme,
} from '@/lib/blog-themes';

describe('themeForTags', () => {
  it('maps a post to the theme matching its first listed tag', () => {
    expect(themeForTags(['politics', 'philosophy'])).toBe('power-institutions');
    expect(themeForTags(['philosophy', 'politics'])).toBe('philosophy-self');
  });

  it('falls back rather than dropping a post with no known tag', () => {
    expect(themeForTags(['completely-unknown-tag'])).toBe(FALLBACK_THEME_SLUG);
    expect(themeForTags([])).toBe(FALLBACK_THEME_SLUG);
  });

  it('is case-insensitive', () => {
    expect(themeForTags(['Politics'])).toBe('power-institutions');
  });
});

describe('groupByTheme', () => {
  it('places every post in exactly one theme', () => {
    const posts = [
      { tags: ['politics'] },
      { tags: ['philosophy'] },
      { tags: ['economics'] },
      { tags: ['nonsense'] },
    ];
    const groups = groupByTheme(posts);
    const total = groups.reduce((n, g) => n + g.posts.length, 0);
    expect(total).toBe(posts.length);
  });

  it('omits empty themes and puts the fallback last', () => {
    const groups = groupByTheme([{ tags: ['politics'] }, { tags: ['nonsense'] }]);
    expect(groups).toHaveLength(2);
    expect(groups[0].theme.slug).toBe('power-institutions');
    expect(groups[groups.length - 1].theme.slug).toBe(FALLBACK_THEME_SLUG);
  });

  it('defines five real themes plus a fallback', () => {
    expect(BLOG_THEMES).toHaveLength(5);
    expect(BLOG_THEMES.map((t) => t.slug)).not.toContain(FALLBACK_THEME_SLUG);
  });
});

describe('TOPIC_HUBS', () => {
  it('mirrors the five real themes instead of the old engineering hubs', async () => {
    const { TOPIC_HUBS } = await import('@/constants/topics');
    expect(TOPIC_HUBS).toHaveLength(5);
    const slugs = TOPIC_HUBS.map((h) => h.slug);
    expect(slugs).toContain('power-institutions');
    expect(slugs).not.toContain('rag-llms');
    expect(slugs).not.toContain('open-source-tools');
  });
});
