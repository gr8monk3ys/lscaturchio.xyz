/**
 * Single source of truth for how the site describes Lorenzo.
 *
 * The hero (src/components/home/Hero.tsx) is the canonical, longform voice;
 * these strings echo it for the metadata / SEO / structured-data layer so the
 * machine-readable identity can never drift from what a visitor actually reads.
 * Update the wording here once, not in ten places.
 */
export const IDENTITY = {
  name: "Lorenzo Scaturchio",
  /** Short role — used on OG cards and as schema.org Person.jobTitle. */
  role: "AI Engineer & Essayist",
  /** Default <title> and OpenGraph/Twitter title. */
  titleDefault: "Lorenzo Scaturchio | AI Engineer & Essayist",
  /** One-sentence description that echoes the homepage thesis. */
  tagline:
    "Lorenzo Scaturchio builds AI systems — RAG, retrieval, and applied ML — and writes essays on technology, power, and the world those systems are built into.",
} as const;
