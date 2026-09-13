import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LinkArrow, isExternalHref } from "@/components/ui/link-arrow";

/**
 * The glyph is a promise about where the click goes, so the interesting cases
 * are the ones that decide it: a same-page anchor (which is where the site was
 * most wrong), a protocol-relative URL (which has to be tested before the bare
 * `/` rule would claim it), and `mailto:` (which leaves for another app rather
 * than another page).
 */
describe("isExternalHref", () => {
  it.each([
    ["/garden", false],
    ["/blog/some-essay", false],
    ["#case-study-merge-gate", false],
    ["?filter=seedling", false],
    ["https://calendly.com/gr8monk3ys/30min", true],
    ["http://example.com", true],
    ["mailto:lorenzosca7@protonmail.ch", true],
    ["tel:+15555555555", true],
    // Leaves the site, and starts with a slash — so slash-means-internal has
    // to be checked after this, not before.
    ["//cdn.example.com/x.png", true],
  ])("%s -> external: %s", (href, expected) => {
    expect(isExternalHref(href)).toBe(expected);
  });
});

describe("LinkArrow", () => {
  function glyphOf(href: string): string | null {
    const { container } = render(<LinkArrow href={href} />);
    return container.querySelector("svg")?.getAttribute("class") ?? null;
  }

  it("gives an internal route the plain arrow", () => {
    expect(glyphOf("/books")).toContain("lucide-arrow-right");
  });

  it("gives a same-page anchor the plain arrow", () => {
    // The worst of the original defects: this scrolls the reader down the page
    // they are already on, and it carried the leaves-the-site glyph.
    expect(glyphOf("#case-study-verso")).toContain("lucide-arrow-right");
  });

  it("gives an off-site destination the up-right arrow", () => {
    expect(glyphOf("https://calendly.com/gr8monk3ys/30min")).toContain("lucide-arrow-up-right");
  });

  it("treats mailto as leaving, because it hands off to another application", () => {
    expect(glyphOf("mailto:lorenzosca7@protonmail.ch")).toContain("lucide-arrow-up-right");
  });

  it("is decorative — the link text carries the accessible name", () => {
    const { container } = render(<LinkArrow href="/lab" />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});
