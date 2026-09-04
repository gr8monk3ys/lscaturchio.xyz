import { describe, it, expect } from "vitest";
import {
  buildBlogMetadata,
  buildPageMetadata,
  buildProjectMetadata,
  ogCardUrl,
} from "@/lib/seo";

function cardParams(url: string) {
  return Object.fromEntries(new URL(url).searchParams.entries());
}

describe("ogCardUrl", () => {
  it("points at the site's own card renderer", () => {
    const url = new URL(ogCardUrl({ title: "Books" }));
    expect(url.pathname).toBe("/api/og");
    expect(url.protocol).toMatch(/^https?:$/);
  });

  it("carries title, description, type and cover when given", () => {
    expect(
      cardParams(
        ogCardUrl({
          title: "T",
          description: "D",
          type: "blog",
          cover: "/images/x.webp",
        })
      )
    ).toEqual({ title: "T", description: "D", type: "blog", cover: "/images/x.webp" });
  });

  it("omits the optional parameters rather than sending empties", () => {
    expect(cardParams(ogCardUrl({ title: "T" }))).toEqual({ title: "T" });
  });

  it("escapes a title that would otherwise break the query string", () => {
    const url = ogCardUrl({ title: "Tag: c++ & friends?" });
    expect(cardParams(url).title).toBe("Tag: c++ & friends?");
  });
});

describe("buildPageMetadata", () => {
  const meta = buildPageMetadata({
    title: "Books",
    description: "What I'm reading.",
    path: "/books",
  });

  it("keeps the OG and Twitter cards agreeing with the page", () => {
    // The 11 hand-rolled blocks this replaced each restated the title and
    // description up to four times, which is how they came to disagree.
    expect(meta.openGraph?.title).toBe("Books");
    expect(meta.twitter?.title).toBe("Books");
    expect(meta.openGraph?.description).toBe(meta.description);
    expect(meta.twitter?.description).toBe(meta.description);
  });

  it("sets the canonical path", () => {
    expect(meta.alternates?.canonical).toBe("/books");
  });

  it("ships exactly one card image, shared by both networks", () => {
    const og = meta.openGraph?.images as { url: string }[];
    const twitter = meta.twitter?.images as string[];
    expect(og).toHaveLength(1);
    expect(twitter).toEqual([og[0].url]);
  });

  it("defaults to the default card and honours an explicit type", () => {
    const og = (meta.openGraph?.images as { url: string }[])[0].url;
    expect(cardParams(og).type).toBe("default");

    const project = buildPageMetadata({
      title: "Projects",
      description: "Case studies.",
      path: "/projects",
      cardType: "project",
    });
    const projectOg = (project.openGraph?.images as { url: string }[])[0].url;
    expect(cardParams(projectOg).type).toBe("project");
  });
});

describe("buildBlogMetadata", () => {
  it("marks the page as an article and passes the cover through", () => {
    const meta = buildBlogMetadata(
      { title: "Strikes Work", description: "Labor history.", image: "/c.webp" },
      "/blog/strikes-work"
    );
    expect((meta.openGraph as { type?: string })?.type).toBe("article");
    const og = (meta.openGraph?.images as { url: string }[])[0].url;
    expect(cardParams(og)).toMatchObject({ type: "blog", cover: "/c.webp" });
    expect(meta.alternates?.canonical).toBe("/blog/strikes-work");
  });

  it("omits the canonical entirely when no path is given", () => {
    const meta = buildBlogMetadata({ title: "T", description: "D" });
    expect(meta.alternates).toBeUndefined();
    expect(meta.openGraph).not.toHaveProperty("url");
  });
});

describe("buildProjectMetadata", () => {
  it("uses the project card and a website type", () => {
    const meta = buildProjectMetadata(
      { title: "merge-gate", description: "Policy engine." },
      "/projects/merge-gate"
    );
    expect((meta.openGraph as { type?: string })?.type).toBe("website");
    const og = (meta.openGraph?.images as { url: string }[])[0].url;
    expect(cardParams(og).type).toBe("project");
  });
});
