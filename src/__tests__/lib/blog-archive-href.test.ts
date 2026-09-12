import { describe, it, expect } from "vitest";
import { getBlogArchiveHref } from "@/lib/blog-archive-href";

/**
 * These assertions used to live in `blog-grid-stage-filter.test.tsx`, against
 * a stage filter `BlogGrid` rendered itself.
 *
 * That filter was a duplicate: the page header rendered a second one 97px
 * above it, with counts and a stronger selected state but no "All", and the
 * two disagreed about what selected looked like. The header row is now the
 * only one, so the component those tests drove no longer has a nav to assert.
 *
 * What they were really protecting is here instead — the href contract, and
 * specifically that choosing a stage does not silently drop an active tag.
 * The header's links were hand-written as `/blog?stage=X` and did exactly
 * that, which is why this helper moved out of the component and why both
 * callers now share it. The "exactly one stage filter" invariant is asserted
 * in `e2e/design-invariants.spec.ts`, where a duplicate control is visible.
 */
describe("getBlogArchiveHref", () => {
  it("returns the bare route when nothing is filtered", () => {
    expect(getBlogArchiveHref(1, "", "")).toBe("/blog");
  });

  it("omits page 1 so an unfiltered archive has one canonical URL", () => {
    // Not `/blog?page=1`, which would be a second spelling of `/blog`.
    expect(getBlogArchiveHref(1, "", "")).toBe("/blog");
    expect(getBlogArchiveHref(2, "", "")).toBe("/blog?page=2");
  });

  it("carries a stage on its own", () => {
    expect(getBlogArchiveHref(1, "", "evergreen")).toBe("/blog?stage=evergreen");
  });

  it("carries a tag on its own", () => {
    expect(getBlogArchiveHref(1, "attention", "")).toBe("/blog?tag=attention");
  });

  it("preserves an active tag when a stage is chosen", () => {
    // The defect this helper was extracted to fix.
    expect(getBlogArchiveHref(1, "attention", "seedling")).toBe(
      "/blog?tag=attention&stage=seedling"
    );
  });

  it("keeps tag and stage across pagination", () => {
    expect(getBlogArchiveHref(3, "attention", "budding")).toBe(
      "/blog?tag=attention&stage=budding&page=3"
    );
  });

  it("encodes a tag that needs it", () => {
    expect(getBlogArchiveHref(1, "political economy", "")).toBe(
      "/blog?tag=political+economy"
    );
  });

  it("treats an empty stage as no stage rather than an empty param", () => {
    expect(getBlogArchiveHref(1, "attention", "")).not.toContain("stage=");
  });
});
