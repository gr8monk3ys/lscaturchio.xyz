export const NEWSLETTER_TOPICS = [
  {
    id: "rag-llms",
    label: "RAG + LLM Systems",
    description: "Retrieval, evaluation, and reliability in production.",
  },
  {
    id: "systems-craft",
    label: "Systems + Craft",
    description: "Performance, shipping, and the boring parts that matter.",
  },
  {
    id: "ai-society",
    label: "AI + Society",
    description: "Power, incentives, and cultural side effects.",
  },
  {
    id: "open-source-tools",
    label: "Open Source + Tools",
    description: "Small tools and repeatable workflows that compound.",
  },
  {
    id: "work-economy",
    label: "Work + Economy",
    description: "Labor, productivity myths, and incentives.",
  },
  {
    id: "places-infrastructure",
    label: "Places + Infrastructure",
    description: "Cities, climate, and the physical substrate.",
  },
] as const;

export type NewsletterTopicId = (typeof NEWSLETTER_TOPICS)[number]["id"];

export const NEWSLETTER_TOPIC_IDS: NewsletterTopicId[] = NEWSLETTER_TOPICS.map((t) => t.id);

