import { products } from "@/constants/products";
import type {
  Product,
  ProjectCategory,
  ProjectStatus,
} from "@/types/products";

/**
 * Queries over the project catalogue.
 *
 * `src/constants/products.tsx` is data with no interface, so before this
 * module existed six callers each re-derived the domain: filter and sort
 * inline in a client component, counts on the projects page, the related
 * join in `Product`, a hand-shaped DTO in the API route, and two separate
 * `products.find` calls in one file. The display vocabulary was restated
 * five times.
 *
 * Every query takes the catalogue as its last argument and defaults to the
 * real one, so tests pass fixtures instead of reaching for a 950-line file.
 * This mirrors `src/lib/blog-data.ts`, which already does exactly this for
 * essays.
 */

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  "ai-ml",
  "web-apps",
  "tools",
  "open-source",
  "data-science",
];

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "ai-ml": "AI/ML",
  "web-apps": "Web Apps",
  tools: "Tools",
  "open-source": "Open Source",
  "data-science": "Data Science",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  maintained: "Maintained",
  archived: "Archived",
};

/**
 * Status as semantic tokens, never raw palette classes. Two of the four
 * copies this replaces used `bg-green-500` / `bg-yellow-500` / `bg-gray-500`
 * directly, which DESIGN.md forbids: every neutral is warm paper, and colour
 * comes from the theme.
 */
export const PROJECT_STATUS_TONE: Record<
  ProjectStatus,
  { bg: string; text: string; dot: string }
> = {
  active: { bg: "bg-success-muted", text: "text-success", dot: "bg-success" },
  maintained: {
    bg: "bg-warning-muted",
    text: "text-warning",
    dot: "bg-warning",
  },
  archived: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export type ProjectSortMode = "featured" | "newest" | "oldest" | "name";

export const PROJECT_SORT_OPTIONS: readonly {
  value: ProjectSortMode;
  label: string;
}[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "A–Z" },
];

export const DEFAULT_PROJECT_STATUS: ProjectStatus = "active";

/** The label a status renders as, including the untagged default. */
export function projectStatusLabel(status: ProjectStatus | undefined): string {
  return PROJECT_STATUS_LABELS[status ?? DEFAULT_PROJECT_STATUS];
}

/** The tone tokens a status renders with, including the untagged default. */
export function projectStatusTone(status: ProjectStatus | undefined) {
  return PROJECT_STATUS_TONE[status ?? DEFAULT_PROJECT_STATUS];
}

/* ------------------------------------------------------------------ *
 * URL parameters
 * ------------------------------------------------------------------ */

/** Narrow an arbitrary query string to a category, or "all". */
export function normalizeProjectCategory(
  value: string | undefined
): ProjectCategory | "all" {
  return PROJECT_CATEGORIES.includes(value as ProjectCategory)
    ? (value as ProjectCategory)
    : "all";
}

/** Narrow an arbitrary query string to a sort mode. */
export function normalizeProjectSort(
  value: string | undefined
): ProjectSortMode {
  return PROJECT_SORT_OPTIONS.some((option) => option.value === value)
    ? (value as ProjectSortMode)
    : "featured";
}

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

/**
 * `startDate` is "YYYY-MM" or absent. Absent sorts oldest rather than
 * throwing the comparator off, and an unparseable value is treated the same
 * way instead of poisoning the sort with NaN.
 */
function startedAt(startDate: string | undefined): number {
  if (!startDate) return 0;
  const value = new Date(`${startDate}-01`).getTime();
  return Number.isFinite(value) ? value : 0;
}

export interface ProjectQuery {
  category?: ProjectCategory | "all";
  /** Exact match against an entry in the project's `stack`. */
  tech?: string;
  sort?: ProjectSortMode;
}

/**
 * The filtered, sorted catalogue. "featured" puts featured projects first
 * and orders each group newest-first, which is the ordering the projects
 * page has always used but never stated anywhere a test could reach.
 */
export function listProjects(
  query: ProjectQuery = {},
  catalogue: readonly Product[] = products
): Product[] {
  const { category = "all", tech = "", sort = "featured" } = query;

  const filtered = catalogue.filter((project) => {
    const categoryMatch =
      category === "all" || project.categories?.includes(category);
    const techMatch = !tech || project.stack?.includes(tech);
    return categoryMatch && techMatch;
  });

  return filtered.sort((a, b) => {
    if (sort === "name") return a.title.localeCompare(b.title);
    if (sort === "oldest") return startedAt(a.startDate) - startedAt(b.startDate);
    if (sort === "newest") return startedAt(b.startDate) - startedAt(a.startDate);

    const featuredDelta = Number(!!b.featured) - Number(!!a.featured);
    if (featuredDelta !== 0) return featuredDelta;
    return startedAt(b.startDate) - startedAt(a.startDate);
  });
}

/** One project by slug. Entries without a slug can never match. */
export function findProject(
  slug: string,
  catalogue: readonly Product[] = products
): Product | undefined {
  if (!slug) return undefined;
  return catalogue.find((project) => project.slug === slug);
}

/** Every project that carries a slug, for routing and the sitemap. */
export function listRoutableProjects(
  catalogue: readonly Product[] = products
): (Product & { slug: string })[] {
  return catalogue.filter(
    (project): project is Product & { slug: string } => !!project.slug
  );
}

/** Projects sharing at least one category with the given one, excluding it. */
export function findRelatedProjects(
  product: Product,
  { limit = 3 }: { limit?: number } = {},
  catalogue: readonly Product[] = products
): Product[] {
  if (!product.categories?.length) return [];

  return catalogue
    .filter(
      (candidate) =>
        candidate.slug !== product.slug &&
        candidate.categories?.some((category) =>
          product.categories?.includes(category)
        )
    )
    .slice(0, limit);
}

/** Headline counts for the projects page. */
export function summarizeCatalogue(catalogue: readonly Product[] = products): {
  total: number;
  featured: number;
  categories: number;
} {
  return {
    total: catalogue.length,
    featured: catalogue.filter((project) => project.featured).length,
    categories: new Set(catalogue.flatMap((project) => project.categories ?? []))
      .size,
  };
}

/**
 * How many projects sit in each category, plus `all`. Categories with no
 * projects are still present with a count of zero, so a caller can decide
 * whether to hide them rather than discovering the gap itself.
 */
export function countProjectsByCategory(
  catalogue: readonly Product[] = products
): Record<ProjectCategory | "all", number> {
  const counts = { all: catalogue.length } as Record<
    ProjectCategory | "all",
    number
  >;
  for (const category of PROJECT_CATEGORIES) {
    counts[category] = catalogue.filter((project) =>
      project.categories?.includes(category)
    ).length;
  }
  return counts;
}

/** Every distinct technology in the catalogue, alphabetically. */
export function listProjectTech(
  catalogue: readonly Product[] = products
): string[] {
  return Array.from(
    new Set(catalogue.flatMap((project) => project.stack ?? []))
  ).sort((a, b) => a.localeCompare(b));
}

/* ------------------------------------------------------------------ *
 * Projections
 * ------------------------------------------------------------------ */

export interface PublicProject {
  slug: string;
  title: string;
  description: string;
  href: string;
  stack: string[];
  categories: ProjectCategory[];
  featured: boolean;
  status: ProjectStatus;
  startDate: string | null;
  demoUrl: string | null;
  sourceUrl: string | null;
  sourcePrivate: boolean;
  caseStudy: Product["caseStudy"] | null;
}

/**
 * The shape `/api/projects` publishes. It deliberately omits `thumbnail`,
 * which is a bundler handle rather than a URL, and never invents a field the
 * record does not carry.
 */
export function toPublicProject(product: Product): PublicProject {
  return {
    slug: product.slug ?? "",
    title: product.title,
    description: product.description,
    href: product.href,
    stack: product.stack ?? [],
    categories: product.categories ?? [],
    featured: Boolean(product.featured),
    status: product.status ?? DEFAULT_PROJECT_STATUS,
    startDate: product.startDate ?? null,
    demoUrl: product.demoUrl ?? null,
    sourceUrl: product.sourceUrl ?? null,
    sourcePrivate: Boolean(product.sourcePrivate),
    caseStudy: product.caseStudy ?? null,
  };
}

export interface HomeCaseStudyCard {
  slug: string;
  kicker: string;
  title: string;
  blurb: string;
  metrics: string[];
  href: string;
  coverSrc: string;
}

/**
 * The home page's case-study cards, in the order asked for.
 *
 * The home page used to hold its own array of titles, blurbs, metrics, hrefs
 * and cover paths for three projects the catalogue already described, and
 * the two had drifted: the page claimed merge-gate had "49 tests" while the
 * record said "49 passing", and the page omitted a fourth metric entirely.
 * The card copy now lives on the project record, so a project's facts and
 * the way it is introduced sit in one file.
 *
 * A slug with no record, or a record with no card, is skipped rather than
 * rendered half-empty — a dead link on the home page is worse than a
 * shorter list.
 */
export function listHomeCaseStudies(
  slugs: readonly string[],
  catalogue: readonly Product[] = products
): HomeCaseStudyCard[] {
  const cards: HomeCaseStudyCard[] = [];

  for (const slug of slugs) {
    const product = findProject(slug, catalogue);
    if (!product?.homeCard) continue;

    cards.push({
      slug,
      kicker: product.homeCard.kicker,
      title: product.homeCard.title,
      blurb: product.homeCard.blurb,
      metrics: product.homeCard.metrics,
      href: `/projects/${slug}`,
      coverSrc: product.homeCard.coverSrc,
    });
  }

  return cards;
}
