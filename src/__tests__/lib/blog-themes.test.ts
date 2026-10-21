import { describe, it, expect } from 'vitest';
import {
  BLOG_THEMES,
  FALLBACK_THEME_SLUG,
  allThemesForTags,
  groupByTheme,
  primaryThemeForTags,
  rankThemesForTags,
} from '@/lib/blog-themes';

const slugsOf = (themes: Array<{ slug: string }>) => themes.map((t) => t.slug);

describe('primaryThemeForTags', () => {
  it('is decided by the first listed tag that matches', () => {
    expect(primaryThemeForTags(['politics', 'philosophy']).slug).toBe('power-institutions');
    expect(primaryThemeForTags(['philosophy', 'politics']).slug).toBe('philosophy-self');
    expect(primaryThemeForTags(['nonsense', 'economics']).slug).toBe('money-work');
  });

  it('falls back rather than dropping a post with no known tag', () => {
    expect(primaryThemeForTags(['completely-unknown-tag']).slug).toBe(FALLBACK_THEME_SLUG);
    expect(primaryThemeForTags([]).slug).toBe(FALLBACK_THEME_SLUG);
  });

  it('is case-insensitive', () => {
    expect(primaryThemeForTags(['Politics']).slug).toBe('power-institutions');
  });
});

describe('allThemesForTags', () => {
  it('counts any matching tag, in table order, regardless of tag order', () => {
    expect(slugsOf(allThemesForTags(['philosophy', 'Politics']))).toEqual([
      'power-institutions',
      'philosophy-self',
    ]);
  });

  it('lists a theme once however many of its tags match', () => {
    expect(slugsOf(allThemesForTags(['politics', 'policy']))).toEqual(['power-institutions']);
  });

  it('gives the fallback alone when nothing matches', () => {
    expect(slugsOf(allThemesForTags(['nonsense']))).toEqual([FALLBACK_THEME_SLUG]);
  });

  it('always contains the primary theme', () => {
    for (const tags of [['philosophy', 'politics'], ['ai', 'economics', 'urban'], ['x'], []]) {
      expect(slugsOf(allThemesForTags(tags))).toContain(primaryThemeForTags(tags).slug);
    }
  });
});

describe('rankThemesForTags', () => {
  it('orders themes by how many tags each claims, ties in table order', () => {
    expect(slugsOf(rankThemesForTags(['philosophy', 'politics', 'policy']))).toEqual([
      'power-institutions',
      'philosophy-self',
    ]);
    expect(slugsOf(rankThemesForTags(['philosophy', 'politics']))).toEqual([
      'power-institutions',
      'philosophy-self',
    ]);
  });

  it('respects the limit and never recommends the fallback', () => {
    expect(rankThemesForTags(['politics', 'philosophy', 'economics'], 1)).toHaveLength(1);
    expect(rankThemesForTags(['nonsense'])).toEqual([]);
  });
});

describe('groupByTheme', () => {
  it('places every post in exactly one theme', () => {
    const posts = [
      { tags: ['politics'] },
      { tags: ['philosophy', 'politics'] },
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
