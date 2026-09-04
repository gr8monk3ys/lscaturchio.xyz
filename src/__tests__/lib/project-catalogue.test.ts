import { describe, it, expect } from "vitest";
import {
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
  countProjectsByCategory,
  findProject,
  findRelatedProjects,
  listHomeCaseStudies,
  listProjectTech,
  listProjects,
  listRoutableProjects,
  normalizeProjectCategory,
  normalizeProjectSort,
  projectStatusLabel,
  projectStatusTone,
  summarizeCatalogue,
  toPublicProject,
} from "@/lib/project-catalogue";
import type { Product } from "@/types/products";
import { products } from "@/constants/products";

// A fixture, not the real catalogue: every query takes the list as its last
// argument precisely so these assertions don't move when a project is added.
const thumbnail = { src: "/x.png", height: 1, width: 1 } as Product["thumbnail"];

const fixture: Product[] = [
  {
    title: "Beta",
    description: "second alphabetically, newest, featured",
    thumbnail,
    href: "/projects/beta",
    slug: "beta",
    featured: true,
    categories: ["tools"],
    status: "active",
    startDate: "2026-05",
    stack: ["TypeScript", "Vite"],
  },
  {
    title: "Alpha",
    description: "first alphabetically, oldest, not featured",
    thumbnail,
    href: "/projects/alpha",
    slug: "alpha",
    categories: ["tools", "ai-ml"],
    status: "archived",
    startDate: "2024-01",
    stack: ["Python"],
  },
  {
    title: "Gamma",
    description: "no start date, no slug",
    thumbnail,
    href: "https://example.com/gamma",
    categories: ["ai-ml"],
    status: "maintained",
    stack: ["TypeScript"],
  },
];

describe("listProjects", () => {
  it("defaults to featured first, then newest", () => {
    expect(listProjects({}, fixture).map((p) => p.title)).toEqual([
      "Beta",
      "Alpha",
      "Gamma",
    ]);
  });

  it("sorts by name, newest and oldest", () => {
    const titles = (sort: "name" | "newest" | "oldest") =>
      listProjects({ sort }, fixture).map((p) => p.title);

    expect(titles("name")).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(titles("newest")).toEqual(["Beta", "Alpha", "Gamma"]);
    // Gamma has no start date, so it sorts as the oldest rather than last.
    expect(titles("oldest")).toEqual(["Gamma", "Alpha", "Beta"]);
  });

  it("filters by category and by tech, and combines them", () => {
    expect(
      listProjects({ category: "ai-ml" }, fixture).map((p) => p.title).sort()
    ).toEqual(["Alpha", "Gamma"]);

    expect(
      listProjects({ tech: "TypeScript" }, fixture).map((p) => p.title).sort()
    ).toEqual(["Beta", "Gamma"]);

    expect(
      listProjects({ category: "ai-ml", tech: "TypeScript" }, fixture).map(
        (p) => p.title
      )
    ).toEqual(["Gamma"]);
  });

  it("treats an absent filter as no filter", () => {
    expect(listProjects({ category: "all", tech: "" }, fixture)).toHaveLength(3);
  });

  it("does not mutate the catalogue it was given", () => {
    const order = fixture.map((p) => p.title);
    listProjects({ sort: "name" }, fixture);
    expect(fixture.map((p) => p.title)).toEqual(order);
  });
});

describe("findProject", () => {
  it("finds by slug and returns undefined otherwise", () => {
    expect(findProject("alpha", fixture)?.title).toBe("Alpha");
    expect(findProject("nope", fixture)).toBeUndefined();
  });

  it("never matches an entry that has no slug", () => {
    expect(findProject("", fixture)).toBeUndefined();
  });
});

describe("listRoutableProjects", () => {
  it("keeps only entries carrying a slug", () => {
    expect(listRoutableProjects(fixture).map((p) => p.slug)).toEqual([
      "beta",
      "alpha",
    ]);
  });
});

describe("findRelatedProjects", () => {
  it("matches on shared category and excludes the project itself", () => {
    const alpha = findProject("alpha", fixture)!;
    expect(findRelatedProjects(alpha, {}, fixture).map((p) => p.title)).toEqual([
      "Beta",
      "Gamma",
    ]);
  });

  it("returns nothing when the project has no categories", () => {
    const uncategorised: Product = { ...fixture[0], categories: undefined };
    expect(findRelatedProjects(uncategorised, {}, fixture)).toEqual([]);
  });

  it("honours the limit", () => {
    const alpha = findProject("alpha", fixture)!;
    expect(findRelatedProjects(alpha, { limit: 1 }, fixture)).toHaveLength(1);
  });
});

describe("counts", () => {
  it("summarises total, featured and distinct categories", () => {
    expect(summarizeCatalogue(fixture)).toEqual({
      total: 3,
      featured: 1,
      categories: 2,
    });
  });

  it("counts every category, including the empty ones", () => {
    const counts = countProjectsByCategory(fixture);
    expect(counts.all).toBe(3);
    expect(counts["tools"]).toBe(2);
    expect(counts["ai-ml"]).toBe(2);
    expect(counts["web-apps"]).toBe(0);
    for (const category of PROJECT_CATEGORIES) {
      expect(counts[category]).toBeTypeOf("number");
    }
  });

  it("lists distinct tech alphabetically", () => {
    expect(listProjectTech(fixture)).toEqual(["Python", "TypeScript", "Vite"]);
  });
});

describe("URL parameter narrowing", () => {
  it("accepts known categories and rejects everything else", () => {
    expect(normalizeProjectCategory("ai-ml")).toBe("ai-ml");
    expect(normalizeProjectCategory("nonsense")).toBe("all");
    expect(normalizeProjectCategory(undefined)).toBe("all");
    expect(normalizeProjectCategory("")).toBe("all");
  });

  it("accepts known sort modes and falls back to featured", () => {
    expect(normalizeProjectSort("newest")).toBe("newest");
    expect(normalizeProjectSort("sideways")).toBe("featured");
    expect(normalizeProjectSort(undefined)).toBe("featured");
  });
});

describe("status vocabulary", () => {
  it("labels an untagged project as active rather than blank", () => {
    expect(projectStatusLabel(undefined)).toBe("Active");
    expect(projectStatusLabel("archived")).toBe("Archived");
  });

  it("uses semantic tokens, never raw palette classes", () => {
    for (const status of ["active", "maintained", "archived"] as const) {
      const tone = projectStatusTone(status);
      for (const value of Object.values(tone)) {
        expect(value).not.toMatch(/-(?:green|yellow|gray|grey|red|blue)-\d/);
      }
    }
  });

  it("labels every category", () => {
    for (const category of PROJECT_CATEGORIES) {
      expect(PROJECT_CATEGORY_LABELS[category]).toBeTruthy();
    }
  });
});

describe("toPublicProject", () => {
  it("fills every optional field rather than emitting undefined", () => {
    const gamma = fixture.find((p) => p.title === "Gamma")!;
    expect(toPublicProject(gamma)).toEqual({
      slug: "",
      title: "Gamma",
      description: "no start date, no slug",
      href: "https://example.com/gamma",
      stack: ["TypeScript"],
      categories: ["ai-ml"],
      featured: false,
      status: "maintained",
      startDate: null,
      demoUrl: null,
      sourceUrl: null,
      sourcePrivate: false,
      caseStudy: null,
    });
  });

  it("never leaks the bundler's thumbnail handle", () => {
    expect(toPublicProject(fixture[0])).not.toHaveProperty("thumbnail");
  });
});

describe("listHomeCaseStudies", () => {
  const withCard: Product[] = [
    {
      ...fixture[0],
      homeCard: {
        kicker: "Kicker",
        title: "Card title",
        blurb: "Card blurb",
        metrics: ["one", "two"],
        coverSrc: "/images/projects/covers/beta.webp",
      },
    },
    fixture[1],
  ];

  it("returns cards in the order asked for", () => {
    expect(listHomeCaseStudies(["beta"], withCard)).toEqual([
      {
        slug: "beta",
        kicker: "Kicker",
        title: "Card title",
        blurb: "Card blurb",
        metrics: ["one", "two"],
        href: "/projects/beta",
        coverSrc: "/images/projects/covers/beta.webp",
      },
    ]);
  });

  it("skips a slug with no record and a record with no card", () => {
    // Better a shorter list than a dead link on the home page.
    expect(listHomeCaseStudies(["ghost", "alpha"], withCard)).toEqual([]);
  });
});

describe("the real catalogue", () => {
  it("gives every routable project a unique slug", () => {
    const slugs = listRoutableProjects().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves every home-page case study to a real project", () => {
    // The home page used to restate these projects' facts in its own array,
    // and the two had drifted. This is the guard that they cannot again.
    const cards = listHomeCaseStudies(["merge-gate", "verso", "cocoon"]);
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(findProject(card.slug)).toBeDefined();
      expect(card.metrics.length).toBeGreaterThan(0);
      expect(card.coverSrc).toMatch(/^\/images\//);
    }
  });

  it("keeps the catalogue's declared categories inside the known set", () => {
    for (const project of products) {
      for (const category of project.categories ?? []) {
        expect(PROJECT_CATEGORIES).toContain(category);
      }
    }
  });
});
