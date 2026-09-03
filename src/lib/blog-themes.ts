/**
 * Themes derived from the actual tag distribution across all 83 essays, not
 * from the engineering-shaped TOPIC_HUBS that preceded them. Measured counts:
 * politics 25 · philosophy 24 · economics 24 · technology 18 · culture 10 ·
 * psychology 9 · institutions 9 · policy 8 · environment 7.
 */
export interface BlogTheme {
  slug: string;
  title: string;
  description: string;
  /** Lowercase blog tags that map into this theme. */
  tags: string[];
}

export const FALLBACK_THEME_SLUG = 'everything-else';

export const BLOG_THEMES: BlogTheme[] = [
  {
    slug: 'power-institutions',
    title: 'Power & institutions',
    description:
      'What systems were actually built to do, as opposed to what they say they do.',
    tags: ['politics', 'institutions', 'policy', 'united-states', 'immigration', 'organizing'],
  },
  {
    slug: 'philosophy-self',
    title: 'Philosophy & the self',
    description:
      'Absurdism, attention to one’s own mind, and the stories we tell to live with both.',
    tags: ['philosophy', 'psychology', 'religion', 'taoism'],
  },
  {
    slug: 'money-work',
    title: 'Money & work',
    description: 'Labour, incentives, and the economic theology we mistake for physics.',
    tags: ['economics', 'labor', 'work', 'productivity'],
  },
  {
    slug: 'technology-attention',
    title: 'Technology & attention',
    description:
      'Building the systems, and being honest about what they do to the people inside them.',
    tags: ['technology', 'attention', 'design', 'ai', 'rag', 'retrieval', 'llms'],
  },
  {
    slug: 'place-climate',
    title: 'Place & climate',
    description: 'Cities, water, community, and the physical substrate everything else sits on.',
    tags: ['environment', 'urban', 'community', 'climate', 'cities', 'housing'],
  },
];

const FALLBACK_THEME: BlogTheme = {
  slug: FALLBACK_THEME_SLUG,
  title: 'Everything else',
  description: 'Pieces that refuse to sit in one drawer.',
  tags: [],
};

/**
 * A post's theme is decided by its FIRST listed tag that matches a theme, so
 * every post appears exactly once. Posts matching nothing land in the fallback
 * rather than vanishing from the index.
 */
export function themeForTags(tags: string[]): string {
  for (const tag of tags) {
    const needle = tag.toLowerCase();
    const theme = BLOG_THEMES.find((t) => t.tags.includes(needle));
    if (theme) return theme.slug;
  }
  return FALLBACK_THEME_SLUG;
}

export function groupByTheme<T extends { tags: string[] }>(
  posts: T[],
): Array<{ theme: BlogTheme; posts: T[] }> {
  const buckets = new Map<string, T[]>();
  for (const post of posts) {
    const slug = themeForTags(post.tags);
    const bucket = buckets.get(slug);
    if (bucket) bucket.push(post);
    else buckets.set(slug, [post]);
  }

  const ordered = [...BLOG_THEMES, FALLBACK_THEME];
  return ordered
    .map((theme) => ({ theme, posts: buckets.get(theme.slug) ?? [] }))
    .filter((group) => group.posts.length > 0);
}
