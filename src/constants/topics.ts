import { BLOG_THEMES } from "@/lib/blog-themes";

export interface TopicHub {
  slug: string;
  title: string;
  description: string;
  /** Blog tags that map into this hub. */
  tags: string[];
  /** Optional curated ordering for standout posts (by blog slug). */
  featuredPosts?: string[];
  /** Optional curated ordering for standout projects (by product slug). */
  featuredProjects?: string[];
}

/**
 * Hubs now mirror the five themes derived from the real tag distribution
 * (src/lib/blog-themes.ts). The previous eight were engineering-shaped —
 * rag-llms, systems-craft, open-source-tools — which sorted a body of work
 * that is 25 political / 24 philosophical / 24 economic into the wrong drawers.
 */
export const TOPIC_HUBS: TopicHub[] = BLOG_THEMES.map((theme) => ({
  slug: theme.slug,
  title: theme.title,
  description: theme.description,
  tags: theme.tags,
}));

export function findTopicHub(slug: string): TopicHub | undefined {
  return TOPIC_HUBS.find((hub) => hub.slug === slug);
}

export function getTopicHubsForTags(tags: string[], limit: number = 3): TopicHub[] {
  const normalized = new Set(tags.map((t) => t.toLowerCase()));
  const scored = TOPIC_HUBS.map((hub) => {
    const score = hub.tags.reduce((acc, tag) => acc + (normalized.has(tag.toLowerCase()) ? 1 : 0), 0);
    return { hub, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.hub);
}

