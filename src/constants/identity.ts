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
  /** Short self-description — used on OG cards and as schema.org Person.description. */
  role: "builds AI that shows its sources",
  /** Default <title> and OpenGraph/Twitter title. */
  titleDefault: "Lorenzo Scaturchio — builds AI that shows its sources",
  /** One-sentence description that echoes the homepage hero. */
  tagline:
    "Lorenzo Scaturchio builds AI and web tools that cite their sources and say what they can't do, and writes about technology, attention and work.",
} as const;
