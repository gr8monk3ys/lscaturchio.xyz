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

export const TOPIC_HUBS: TopicHub[] = [
  {
    slug: "rag-llms",
    title: "RAG + LLM Systems",
    description: "Applied retrieval, evaluation, and real-world reliability.",
    tags: ["rag", "retrieval", "llms", "ai", "embeddings"],
    featuredPosts: ["building-rag-systems"],
    featuredProjects: ["talker"],
  },
  {
    slug: "ai-society",
    title: "AI + Society",
    description: "How incentives, culture, and power shape what we build.",
    tags: ["ai", "culture", "politics", "ethics", "technology"],
    featuredPosts: ["algorithmic-culture", "myth-of-neutral-tool"],
  },
  {
    slug: "systems-craft",
    title: "Systems + Craft",
    description: "Shipping, performance, and the boring parts that make it work.",
    tags: ["systems", "engineering", "web", "performance"],
    featuredPosts: ["how-i-built-this-site"],
  },
  {
    slug: "work-economy",
    title: "Work + Economy",
    description: "Labor, incentives, and the stories we tell about productivity.",
    tags: ["work", "economy", "labor", "productivity"],
    featuredPosts: ["future-of-work", "against-productivity-time"],
  },
  {
    slug: "places-infrastructure",
    title: "Places + Infrastructure",
    description: "Cities, governance, climate, and the physical substrate.",
    tags: ["cities", "infrastructure", "climate", "housing"],
    featuredPosts: ["suburbs-are-ponzi-scheme", "why-your-city-is-expensive"],
  },
  {
    slug: "open-source-tools",
    title: "Open Source + Tools",
    description: "Pragmatic tools and small systems that compound.",
    tags: ["open source", "tools", "developer tools"],
    featuredProjects: ["leetcode-solver-bot", "blog-ai"],
  },
];

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

