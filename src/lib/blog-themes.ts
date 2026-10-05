/**
 * The site's themes, and the three ways an essay belongs to one.
 *
 * Themes are derived from the actual tag distribution across the essays, not
 * from the engineering-shaped topic hubs that preceded them. Measured counts:
 * politics 25 · philosophy 24 · economics 24 · technology 18 · culture 10 ·
 * psychology 9 · institutions 9 · policy 8 · environment 7.
 *
 * Membership has three answers, on purpose, each named for what it does
 * rather than re-derived by the page that needs it:
 *
 * - `primaryThemeForTags`: the FIRST listed tag that matches decides, so an
 *   essay sits in exactly one theme. The /blog sections and the homepage index
 *   use this; an essay appearing twice in one index would read as a bug.
 * - `allThemesForTags`: ANY matching tag counts, so an essay can belong to
 *   several themes. The /topics hubs use this (through the catalogue's
 *   `getBlogsInTheme`); a hub that hid an essay because a different tag came
 *   first would under-report what the hub is about.
 * - `rankThemesForTags`: themes ordered by how many of the essay's tags they
 *   claim. The "Explore" links under an essay and the homepage's next-read
 *   suggestion use this.
 *
 * All three read the one table below. The /topics hubs used to be a separate
 * `TOPIC_HUBS` list in `src/constants/topics.ts` that re-mapped this table
 * field for field.
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

function normalizeTags(tags: readonly string[]): Set<string> {
  return new Set(tags.map((tag) => tag.toLowerCase()));
}

/**
 * Primary theme: the theme of the essay's FIRST listed tag that matches one,
 * so every essay has exactly one. An essay matching nothing gets the fallback
 * rather than vanishing from the index.
 */
export function primaryThemeForTags(tags: readonly string[]): BlogTheme {
  for (const tag of tags) {
    const needle = tag.toLowerCase();
    const theme = BLOG_THEMES.find((t) => t.tags.includes(needle));
    if (theme) return theme;
  }
  return FALLBACK_THEME;
}

/**
 * All themes: every theme ANY of the essay's tags matches, in table order. An
 * essay matching nothing belongs to the fallback alone, so the primary theme
 * is always one of these.
 */
export function allThemesForTags(tags: readonly string[]): BlogTheme[] {
  const normalized = normalizeTags(tags);
  const matched = BLOG_THEMES.filter((theme) =>
    theme.tags.some((tag) => normalized.has(tag))
  );
  return matched.length > 0 ? matched : [FALLBACK_THEME];
}

/**
 * Themes ranked by how many of the essay's tags each one claims, best first,
 * ties in table order. Never the fallback: a ranking is a recommendation, and
 * "everything else" is not somewhere to send a reader.
 */
export function rankThemesForTags(
  tags: readonly string[],
  limit: number = 3
): BlogTheme[] {
  const normalized = normalizeTags(tags);
  return BLOG_THEMES.map((theme) => ({
    theme,
    score: theme.tags.filter((tag) => normalized.has(tag)).length,
  }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.theme);
}

/** The /blog and homepage index: each essay once, under its primary theme. */
export function groupByTheme<T extends { tags: string[] }>(
  posts: T[],
): Array<{ theme: BlogTheme; posts: T[] }> {
  const buckets = new Map<string, T[]>();
  for (const post of posts) {
    const slug = primaryThemeForTags(post.tags).slug;
    const bucket = buckets.get(slug);
    if (bucket) bucket.push(post);
    else buckets.set(slug, [post]);
  }

  const ordered = [...BLOG_THEMES, FALLBACK_THEME];
  return ordered
    .map((theme) => ({ theme, posts: buckets.get(theme.slug) ?? [] }))
    .filter((group) => group.posts.length > 0);
}
