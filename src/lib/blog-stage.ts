/** Digital-garden maturity stages, ordered seedling -> evergreen. */
export type BlogStage = "seedling" | "budding" | "evergreen";

export const BLOG_STAGES: readonly BlogStage[] = [
  "seedling",
  "budding",
  "evergreen",
];

/**
 * The single gate every stage value passes through. MDX `meta` is untyped at
 * the source level, so a typo like "evergeen" must degrade to "no stage"
 * rather than leak a broken value into the UI or a filter that matches nothing.
 */
export function isBlogStage(value: unknown): value is BlogStage {
  return (
    typeof value === "string" &&
    (BLOG_STAGES as readonly string[]).includes(value)
  );
}

/** Filter a list of stage-bearing items; empty/invalid stage returns all. */
export function filterByStage<T extends { stage?: BlogStage }>(
  items: T[],
  stage: string
): T[] {
  return isBlogStage(stage) ? items.filter((item) => item.stage === stage) : items;
}

export const STAGE_LABELS: Record<BlogStage, { label: string; blurb: string }> = {
  seedling: { label: "SEEDLING", blurb: "Rough notes, still forming." },
  budding: { label: "BUDDING", blurb: "Developing, partially revised." },
  evergreen: { label: "EVERGREEN", blurb: "Considered finished and maintained." },
};
