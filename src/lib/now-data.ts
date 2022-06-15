// Single source of truth for when this snapshot was last reviewed. Update this
// ISO date whenever you revise the content below — the human-readable label and
// the staleness banner on /now are both derived from it, so they can never drift.
export const NOW_LAST_UPDATED = "2025-01-15";

// A /now page is a promise of currency. If it goes longer than this without a
// review, the page surfaces a visible "may be out of date" notice instead of
// silently implying everything below is still true.
export const NOW_STALE_AFTER_DAYS = 120;

export const nowData = {
  /** Human-readable label, derived from NOW_LAST_UPDATED so it stays in sync. */
  lastUpdatedLabel: new Date(NOW_LAST_UPDATED).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
  location: {
    label: "Southern California",
    detail: "Working remotely as a freelance AI consultant and developer.",
  },
  workingOn: {
    clientProjects: [
      "Building production RAG systems with LangChain and Neon PostgreSQL",
      "Developing autonomous AI agents for enterprise clients",
      "Consulting on AI integration strategies",
    ],
    personalProjects: [
      "Rebuilding this website with Next.js App Router",
      "Creating open-source AI tools and templates",
      "Writing technical blog posts about AI engineering",
    ],
  },
  learning: {
    technicalSkills: [
      "Advanced prompt engineering techniques",
      "Fine-tuning LLMs with LoRA and QLoRA",
      "Vector database optimization (Pinecone, Weaviate)",
      "Next.js Server Components deep dive",
    ],
    reading: [
      "The Alignment Problem by Brian Christian",
      "Designing Data-Intensive Applications by Martin Kleppmann",
      "Research papers on retrieval-augmented generation",
    ],
    courses: [
      "DeepLearning.AI - Building LLM Applications",
      "Full Stack LangChain course",
    ],
  },
  thinkingAbout: [
    "How to build AI systems that are truly helpful rather than just impressive",
    "The future of knowledge work in an AI-augmented world",
    "Balancing technical sophistication with practical utility",
    "The ethical implications of autonomous AI systems",
  ],
} as const;

/**
 * How stale is the /now snapshot? Computed at render time so the page can warn
 * visitors (and remind the owner) when it has drifted past NOW_STALE_AFTER_DAYS.
 */
export function getNowFreshness(now: Date = new Date()): {
  isStale: boolean;
  daysSinceUpdate: number;
} {
  const updated = new Date(NOW_LAST_UPDATED).getTime();
  const daysSinceUpdate = Math.max(
    0,
    Math.floor((now.getTime() - updated) / (1000 * 60 * 60 * 24)),
  );
  return { isStale: daysSinceUpdate > NOW_STALE_AFTER_DAYS, daysSinceUpdate };
}

