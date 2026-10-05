import { describe, expect, it } from "vitest";
import { isPathActive } from "@/lib/navigation-path";

describe("isPathActive", () => {
  it("matches the page and its children, not siblings that share a prefix", () => {
    expect(isPathActive("/blog", "/blog")).toBe(true);
    expect(isPathActive("/blog/against-optimization", "/blog")).toBe(true);
    expect(isPathActive("/blogroll", "/blog")).toBe(false);
  });

  it("matches home only on home", () => {
    expect(isPathActive("/", "/")).toBe(true);
    expect(isPathActive("/blog", "/")).toBe(false);
  });

  it("ignores a fragment on the nav href", () => {
    expect(isPathActive("/work-with-me", "/work-with-me#services")).toBe(true);
  });

  // usePathname() reports the prefixed path behind the proxy's locale rewrite;
  // the nav's hrefs are unprefixed. Verified in a browser at /es/blog, where
  // the header's Writing link had lost aria-current="page".
  it("compares a locale-prefixed path on its bare path", () => {
    expect(isPathActive("/es/blog", "/blog")).toBe(true);
    expect(isPathActive("/zh-cn/blog/against-optimization", "/blog")).toBe(true);
    expect(isPathActive("/es", "/")).toBe(true);
    expect(isPathActive("/es/blog", "/")).toBe(false);
  });

  it("does not treat an unknown first segment as a locale", () => {
    expect(isPathActive("/klingon/blog", "/blog")).toBe(false);
  });
});
