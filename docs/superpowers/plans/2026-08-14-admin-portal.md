# Admin Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A GitHub-OAuth-gated `/admin` portal that publishes blog posts, photos, the now page, and the links page by committing to `main` via the GitHub API.

**Architecture:** New admin libs under `src/lib/admin/` (session, GitHub client, content generation, Zod schemas), mutating API routes under `src/app/api/admin/`, and server-gated pages under `src/app/admin/`. An enabling refactor first moves photos/now/links data into `src/data/*.json` so the portal edits data, never code. Spec: `docs/superpowers/specs/2026-08-14-admin-portal-design.md`.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Zod, sharp (already a dep), `@mdx-js/mdx` (new dep, server-side MDX validation), node `crypto` HMAC sessions, hand-rolled GitHub OAuth (no NextAuth), Vitest + Playwright.

## Global Constraints

- TypeScript strict; **no `any`** (use `unknown` + narrowing); no `@ts-ignore`/`eslint-disable`.
- 2-space indent, double quotes, semicolons; kebab-case filenames.
- API routes: `validateCsrf` on mutations, `withRateLimit(handler, RATE_LIMITS.X)`, Zod via `parseBody`, respond with `apiSuccess`/`ApiErrors` envelope.
- Degrade gracefully when env is unconfigured (render/return "not configured", never throw at import time).
- Conventional Commits; run `bun install` after any `package.json` dep change (CI uses `--frozen-lockfile`); `~/.bun/bin/bun` (not on PATH).
- Tests in `src/__tests__/` (vitest), e2e in `e2e/` (playwright). Mock `@/lib/with-rate-limit`, `@/lib/csrf` per existing pattern in `src/__tests__/api/views.test.ts`.
- New env vars: `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `ADMIN_ALLOWED_LOGIN`, `ADMIN_SESSION_SECRET`, `GITHUB_CONTENT_TOKEN`, optional `GITHUB_CONTENT_REPO` (default `gr8monk3ys/lscaturchio.xyz`).
- Never push to `main`; work lands as one PR from `feat/admin-portal`.

---

### Task 0: Branch setup

**Files:** none (git only)

- [ ] **Step 1:** `git checkout -b feat/admin-portal` (from local `main`, which carries the spec commit), then restore local main to origin: `git branch -f main origin/main`.
- [ ] **Step 2:** Add dep: edit `package.json` dependencies to add `"@mdx-js/mdx": "^3.1.0"`, run `~/.bun/bin/bun install`, commit `package.json` + `bun.lock` as `chore(deps): add @mdx-js/mdx for server-side MDX validation`.

### Task 1: Extract photos data to `src/data/photos.json`

**Files:**
- Create: `src/data/photos.json`
- Modify: `src/constants/photos.ts`

**Interfaces:** `photos: Photo[]` export is unchanged for consumers; data now lives in JSON.

- [ ] **Step 1:** Create `src/data/photos.json` containing `[]`.
- [ ] **Step 2:** In `src/constants/photos.ts`, keep the `Photo`/`PhotoCategory` types, `photoCategories`, and the workflow comment (updated to mention the portal), and replace `export const photos: Photo[] = [];` with:

```ts
import photosJson from "@/data/photos.json";

export const photos: Photo[] = photosJson as Photo[];
```

- [ ] **Step 3:** Run `npm run typecheck && npm test -- --run src/__tests__` — expect pass (gallery ships empty either way).
- [ ] **Step 4:** Commit: `refactor(photos): read gallery entries from src/data/photos.json`

### Task 2: Extract now data to `src/data/now.json`

**Files:**
- Create: `src/data/now.json`
- Modify: `src/lib/now-data.ts`

**Interfaces:** `NOW_LAST_UPDATED`, `NOW_STALE_AFTER_DAYS`, `nowData`, `getNowFreshness` keep their exact names and shapes; `nowData.lastUpdatedLabel` stays derived.

- [ ] **Step 1:** Create `src/data/now.json` with the current values of `now-data.ts` verbatim:

```json
{
  "lastUpdated": "2026-07-31",
  "location": { "label": "...copy from now-data.ts...", "detail": "..." },
  "building": [ { "title": "...", "href": "...", "note": "..." } ],
  "thinkingAbout": ["..."]
}
```

(Copy every entry exactly from `src/lib/now-data.ts` — four `building` entries, four `thinkingAbout` strings.)

- [ ] **Step 2:** Rewrite `src/lib/now-data.ts` to import the JSON, preserving the existing doc comments:

```ts
import nowJson from "@/data/now.json";

export const NOW_LAST_UPDATED: string = nowJson.lastUpdated;
export const NOW_STALE_AFTER_DAYS = 120;

export interface NowBuild {
  title: string;
  href: string;
  note: string;
}

export interface NowContent {
  lastUpdated: string;
  location: { label: string; detail: string };
  building: NowBuild[];
  thinkingAbout: string[];
}

export const nowData = {
  lastUpdatedLabel: new Date(NOW_LAST_UPDATED).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
  location: nowJson.location,
  building: nowJson.building as NowBuild[],
  thinkingAbout: nowJson.thinkingAbout as string[],
};
```

Keep `getNowFreshness` unchanged.

- [ ] **Step 3:** `npm run typecheck && npm test -- --run` — the now page tests (if any) and build stay green. Visually diff `/now` later in verification.
- [ ] **Step 4:** Commit: `refactor(now): read /now content from src/data/now.json`

### Task 3: Extract links data to `src/data/links.json`

**Files:**
- Create: `src/data/links.json`, `src/types/links.ts`
- Modify: `src/app/links/page.tsx`

**Interfaces (Produces):** `src/types/links.ts` exports:

```ts
export interface LinkData {
  title: string;
  link: string;
  linkDescription: string;
  rss?: string;
}

export interface SectionData {
  title: string;
  description: string;
  links: LinkData[];
}

export type LinksContent = Record<string, SectionData>;
```

- [ ] **Step 1:** Create `src/types/links.ts` as above.
- [ ] **Step 2:** Convert the `linksData` object literal in `src/app/links/page.tsx` to `src/data/links.json` (quote keys, strip trailing commas). Validate: `node -e "JSON.parse(require('fs').readFileSync('src/data/links.json','utf8')); console.log('ok')"`.
- [ ] **Step 3:** In `src/app/links/page.tsx`, delete the inline interfaces and literal; add:

```ts
import linksJson from "@/data/links.json";
import type { LinksContent, SectionData } from "@/types/links";

const linksData: LinksContent = linksJson as LinksContent;
```

- [ ] **Step 4:** `npm run typecheck && npm run lint` — pass. Commit: `refactor(links): read /links sections from src/data/links.json`

### Task 4: Admin session lib

**Files:**
- Create: `src/lib/admin/session.ts`
- Test: `src/__tests__/lib/admin-session.test.ts`

**Interfaces (Produces):**

```ts
export const ADMIN_SESSION_COOKIE = "admin_session";
export function isAdminConfigured(): boolean;
export function createSessionToken(login: string, now?: number): string;
export function verifySessionToken(token: string | undefined, now?: number): { login: string } | null;
export function requireAdmin(req: NextRequest): NextResponse | null; // null = authorized
export async function getServerSession(): Promise<{ login: string } | null>; // for server components
```

- [ ] **Step 1: Write the failing test** `src/__tests__/lib/admin-session.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/admin/session";

describe("admin session", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = "test-secret";
    process.env.ADMIN_ALLOWED_LOGIN = "gr8monk3ys";
  });

  it("round-trips a valid token", () => {
    const token = createSessionToken("gr8monk3ys");
    expect(verifySessionToken(token)).toEqual({ login: "gr8monk3ys" });
  });

  it("rejects a tampered signature", () => {
    const token = createSessionToken("gr8monk3ys");
    expect(verifySessionToken(`${token.slice(0, -2)}xx`)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = createSessionToken("gr8monk3ys", Date.now() - 8 * 24 * 60 * 60 * 1000);
    expect(verifySessionToken(token)).toBeNull();
  });

  it("rejects a login not on the allowlist", () => {
    const token = createSessionToken("someone-else");
    expect(verifySessionToken(token)).toBeNull();
  });

  it("rejects everything when the secret is unset", () => {
    const token = createSessionToken("gr8monk3ys");
    delete process.env.ADMIN_SESSION_SECRET;
    expect(verifySessionToken(token)).toBeNull();
  });
});
```

- [ ] **Step 2:** `npm test -- --run src/__tests__/lib/admin-session.test.ts` — FAIL (module missing).
- [ ] **Step 3: Implement** `src/lib/admin/session.ts`:

```ts
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ApiErrors } from "@/lib/api-response";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_OAUTH_CLIENT_ID &&
      process.env.GITHUB_OAUTH_CLIENT_SECRET &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.GITHUB_CONTENT_TOKEN
  );
}

function allowedLogin(): string {
  return process.env.ADMIN_ALLOWED_LOGIN || "gr8monk3ys";
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(login: string, now: number = Date.now()): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const payload = Buffer.from(
    JSON.stringify({ login, exp: now + SESSION_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  now: number = Date.now()
): { login: string } | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload, secret);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      login?: unknown;
      exp?: unknown;
    };
    if (typeof data.login !== "string" || typeof data.exp !== "number") return null;
    if (data.exp < now) return null;
    if (data.login.toLowerCase() !== allowedLogin().toLowerCase()) return null;
    return { login: data.login };
  } catch {
    return null;
  }
}

export function requireAdmin(req: NextRequest): NextResponse | null {
  if (!isAdminConfigured()) {
    return ApiErrors.internalError("Admin portal is not configured");
  }
  const session = verifySessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) return ApiErrors.unauthorized();
  return null;
}

export async function getServerSession(): Promise<{ login: string } | null> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}
```

- [ ] **Step 4:** Test passes. `npm run typecheck` clean.
- [ ] **Step 5:** Commit: `feat(admin): signed-cookie session lib with allowlist`

### Task 5: GitHub client lib

**Files:**
- Create: `src/lib/admin/github.ts`
- Test: `src/__tests__/lib/admin-github.test.ts`

**Interfaces (Produces):**

```ts
export interface CommitFile { path: string; content: Buffer | string }
export async function getFile(path: string): Promise<{ text: string; sha: string } | null>; // null on 404
export async function listBlogSlugs(): Promise<string[]>;
export async function commitToMain(files: CommitFile[], message: string): Promise<{ sha: string; url: string }>;
```

- [ ] **Step 1: Write the failing test** `src/__tests__/lib/admin-github.test.ts` (mock `global.fetch`):

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFile, commitToMain, listBlogSlugs } from "@/lib/admin/github";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  fetchMock.mockReset();
  process.env.GITHUB_CONTENT_TOKEN = "test-token";
  process.env.GITHUB_CONTENT_REPO = "owner/repo";
});

describe("getFile", () => {
  it("decodes base64 content", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { content: Buffer.from("hello").toString("base64"), sha: "abc" })
    );
    expect(await getFile("src/data/now.json")).toEqual({ text: "hello", sha: "abc" });
  });

  it("returns null on 404", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(404, { message: "Not Found" }));
    expect(await getFile("nope")).toBeNull();
  });
});

describe("listBlogSlugs", () => {
  it("returns directory names only", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, [
        { name: "post-a", type: "dir" },
        { name: "readme.md", type: "file" },
      ])
    );
    expect(await listBlogSlugs()).toEqual(["post-a"]);
  });
});

describe("commitToMain", () => {
  function mockHappyPath() {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { object: { sha: "head" } })) // ref
      .mockResolvedValueOnce(jsonResponse(200, { tree: { sha: "basetree" } })) // commit
      .mockResolvedValueOnce(jsonResponse(201, { sha: "blob1" })) // blob
      .mockResolvedValueOnce(jsonResponse(201, { sha: "tree1" })) // tree
      .mockResolvedValueOnce(jsonResponse(201, { sha: "commit1" })) // commit
      .mockResolvedValueOnce(jsonResponse(200, {})); // ref patch
  }

  it("creates blob, tree, commit, and updates the ref", async () => {
    mockHappyPath();
    const result = await commitToMain([{ path: "a.txt", content: "hi" }], "msg");
    expect(result.sha).toBe("commit1");
    expect(result.url).toBe("https://github.com/owner/repo/commit/commit1");
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("retries once when the ref update is rejected", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { object: { sha: "head" } }))
      .mockResolvedValueOnce(jsonResponse(200, { tree: { sha: "basetree" } }))
      .mockResolvedValueOnce(jsonResponse(201, { sha: "blob1" }))
      .mockResolvedValueOnce(jsonResponse(201, { sha: "tree1" }))
      .mockResolvedValueOnce(jsonResponse(201, { sha: "commit1" }))
      .mockResolvedValueOnce(jsonResponse(422, { message: "not a fast forward" }));
    mockHappyPath();
    const result = await commitToMain([{ path: "a.txt", content: "hi" }], "msg");
    expect(result.sha).toBe("commit1");
    expect(fetchMock).toHaveBeenCalledTimes(12);
  });
});
```

- [ ] **Step 2:** Run — FAIL (module missing).
- [ ] **Step 3: Implement** `src/lib/admin/github.ts`:

```ts
const API = "https://api.github.com";

function repo(): string {
  return process.env.GITHUB_CONTENT_REPO || "gr8monk3ys/lscaturchio.xyz";
}

function authHeaders(): Record<string, string> {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) throw new Error("GITHUB_CONTENT_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function gh(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API}/repos/${repo()}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
}

async function ghJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await gh(path, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${init?.method || "GET"} ${path} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export interface CommitFile {
  path: string;
  content: Buffer | string;
}

export async function getFile(path: string): Promise<{ text: string; sha: string } | null> {
  const res = await gh(`/contents/${path}?ref=main`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET /contents/${path} failed (${res.status})`);
  const data = (await res.json()) as { content: string; sha: string };
  return { text: Buffer.from(data.content, "base64").toString("utf8"), sha: data.sha };
}

export async function listBlogSlugs(): Promise<string[]> {
  const entries = await ghJson<Array<{ name: string; type: string }>>(
    "/contents/src/app/blog?ref=main"
  );
  return entries.filter((e) => e.type === "dir").map((e) => e.name);
}

async function attemptCommit(
  files: CommitFile[],
  message: string
): Promise<{ sha: string; url: string } | null> {
  const ref = await ghJson<{ object: { sha: string } }>("/git/ref/heads/main");
  const headSha = ref.object.sha;
  const headCommit = await ghJson<{ tree: { sha: string } }>(`/git/commits/${headSha}`);

  const tree: Array<{ path: string; mode: string; type: string; sha: string }> = [];
  for (const file of files) {
    const blob = await ghJson<{ sha: string }>("/git/blobs", {
      method: "POST",
      body: JSON.stringify({
        content: Buffer.from(file.content).toString("base64"),
        encoding: "base64",
      }),
    });
    tree.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const newTree = await ghJson<{ sha: string }>("/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
  });
  const commit = await ghJson<{ sha: string }>("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
  });

  const patch = await gh("/git/refs/heads/main", {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
  if (patch.status === 422) return null; // ref moved under us — caller retries
  if (!patch.ok) throw new Error(`GitHub ref update failed (${patch.status})`);
  return { sha: commit.sha, url: `https://github.com/${repo()}/commit/${commit.sha}` };
}

export async function commitToMain(
  files: CommitFile[],
  message: string
): Promise<{ sha: string; url: string }> {
  const first = await attemptCommit(files, message);
  if (first) return first;
  const second = await attemptCommit(files, message);
  if (second) return second;
  throw new Error("GitHub commit failed twice: main moved during both attempts");
}
```

- [ ] **Step 4:** Tests pass; `npm run typecheck` clean.
- [ ] **Step 5:** Commit: `feat(admin): GitHub commit client (trees API, single-commit multi-file)`

### Task 6: Blog content generation + schemas

**Files:**
- Create: `src/lib/admin/blog-content.ts`, `src/lib/admin/schemas.ts`
- Test: `src/__tests__/lib/admin-blog-content.test.ts`

**Interfaces (Produces):**

```ts
// blog-content.ts
export interface PostMeta {
  title: string; description: string; date: string; image?: string;
  tags: string[]; series?: string; seriesOrder?: number; stage?: BlogStage;
}
export function slugify(title: string): string;
export function serializeMeta(meta: PostMeta): string;      // the `export const meta = {...}` block
export function parseMeta(source: string): PostMeta | null; // null when not machine-shaped
export function extractBody(source: string): string;
export function buildContentMdx(meta: PostMeta, body: string): string;
export function buildPageTsx(slug: string): string;
export async function validateMdx(source: string): Promise<{ ok: true } | { ok: false; error: string }>;

// schemas.ts
export const postPublishSchema; // z.object — title, slug, description, date, tags, series?, seriesOrder?, stage?, body, coverImage?(dataURL), overwrite?
export const photoEntrySchema;  // filename, category, alt, camera, lens, settings, recipe?, location?, date
export const photosPublishSchema; // { entries: photoEntrySchema[] } (files arrive as multipart)
export const nowContentSchema;  // matches NowContent
export const linksContentSchema; // matches LinksContent
```

- [ ] **Step 1: Failing tests** `src/__tests__/lib/admin-blog-content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  slugify,
  serializeMeta,
  parseMeta,
  extractBody,
  buildContentMdx,
  buildPageTsx,
  validateMdx,
  type PostMeta,
} from "@/lib/admin/blog-content";

const meta: PostMeta = {
  title: 'Testing "Quotes" & Ampersands',
  description: "A post.",
  date: "2026-08-14",
  image: "/images/blog/testing-quotes-ampersands.webp",
  tags: ["testing", "meta"],
  series: "The Test Series",
  seriesOrder: 2,
  stage: "seedling",
};

describe("slugify", () => {
  it("lowercases, strips punctuation, hyphenates", () => {
    expect(slugify('Testing "Quotes" & Ampersands!')).toBe("testing-quotes-ampersands");
  });
  it("collapses repeats and trims hyphens", () => {
    expect(slugify("--Hello   World--")).toBe("hello-world");
  });
});

describe("meta round-trip", () => {
  it("serializeMeta -> parseMeta is identity", () => {
    const mdx = buildContentMdx(meta, "## Hello\n\nBody text.");
    expect(parseMeta(mdx)).toEqual(meta);
    expect(extractBody(mdx)).toBe("## Hello\n\nBody text.");
  });

  it("omits absent optional fields", () => {
    const minimal: PostMeta = {
      title: "T", description: "D", date: "2026-01-01", tags: [],
    };
    const block = serializeMeta(minimal);
    expect(block).not.toContain("series");
    expect(block).not.toContain("image");
    expect(parseMeta(buildContentMdx(minimal, "x"))).toEqual(minimal);
  });

  it("parses an existing real-shaped post meta", () => {
    const source = `export const meta = {
  title: "Abolition Isn't What You Think",
  description: "Abolition is not the absence of safety.",
  date: "2026-01-31",
  image: "/images/blog/abolition.webp",
  tags: ["politics", "justice"],
  series: "The Carceral State",
  seriesOrder: 8,
  stage: "budding",
}

## Body
`;
    expect(parseMeta(source)?.title).toBe("Abolition Isn't What You Think");
    expect(parseMeta(source)?.seriesOrder).toBe(8);
  });

  it("returns null for a meta block it cannot parse", () => {
    expect(parseMeta("export const meta = {\n  title: someVariable,\n}\n")).toBeNull();
  });
});

describe("buildPageTsx", () => {
  it("embeds the slug in the blog path", () => {
    expect(buildPageTsx("my-post")).toContain('"/blog/my-post"');
  });
});

describe("validateMdx", () => {
  it("accepts valid mdx", async () => {
    expect((await validateMdx(buildContentMdx(meta, "# ok"))).ok).toBe(true);
  });
  it("rejects broken jsx with an error message", async () => {
    const result = await validateMdx("<Unclosed");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3: Implement** `src/lib/admin/blog-content.ts`:

```ts
import { compile } from "@mdx-js/mdx";
import type { BlogStage } from "@/lib/blog-stage";

export interface PostMeta {
  title: string;
  description: string;
  date: string;
  image?: string;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  stage?: BlogStage;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const META_KEY_ORDER = [
  "title",
  "description",
  "date",
  "image",
  "tags",
  "series",
  "seriesOrder",
  "stage",
] as const;

export function serializeMeta(meta: PostMeta): string {
  const lines: string[] = ["export const meta = {"];
  for (const key of META_KEY_ORDER) {
    const value = meta[key];
    if (value === undefined) continue;
    lines.push(`  ${key}: ${JSON.stringify(value)},`);
  }
  lines.push("}");
  return lines.join("\n");
}

const META_BLOCK_RE = /export const meta = \{\n([\s\S]*?)\n\}/;

export function parseMeta(source: string): PostMeta | null {
  const match = source.match(META_BLOCK_RE);
  if (!match) return null;
  const result: Record<string, unknown> = {};
  for (const rawLine of match[1].split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const kv = line.match(/^(\w+):\s*(.*?),?$/);
    if (!kv) return null;
    try {
      result[kv[1]] = JSON.parse(kv[2]);
    } catch {
      return null;
    }
  }
  if (
    typeof result.title !== "string" ||
    typeof result.description !== "string" ||
    typeof result.date !== "string"
  ) {
    return null;
  }
  if (result.tags === undefined) result.tags = [];
  if (!Array.isArray(result.tags)) return null;
  return result as unknown as PostMeta;
}

export function extractBody(source: string): string {
  const match = source.match(META_BLOCK_RE);
  if (!match) return source;
  return source.slice((match.index ?? 0) + match[0].length).replace(/^\n+/, "").replace(/\n+$/, "");
}

export function buildContentMdx(meta: PostMeta, body: string): string {
  return `${serializeMeta(meta)}\n\n${body.trim()}\n`;
}

export function buildPageTsx(slug: string): string {
  return `import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/${slug}");

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
`;
}

export async function validateMdx(
  source: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await compile(source, { format: "mdx" });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
```

- [ ] **Step 4: Implement** `src/lib/admin/schemas.ts`:

```ts
import { z } from "zod";
import { BLOG_STAGES } from "@/lib/blog-stage";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const postPublishSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase-hyphenated"),
  description: z.string().min(1).max(300),
  date: isoDate,
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  series: z.string().min(1).max(80).optional(),
  seriesOrder: z.number().int().min(1).max(99).optional(),
  stage: z.enum(BLOG_STAGES as unknown as [string, ...string[]]).optional(),
  body: z.string().min(1).max(200_000),
  coverImage: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, "Cover must be a png/jpeg/webp data URL")
    .max(15_000_000)
    .optional(),
  overwrite: z.boolean().default(false),
});
export type PostPublishInput = z.infer<typeof postPublishSchema>;

export const photoEntrySchema = z.object({
  filename: z.string().min(1).max(200),
  category: z.enum(["travel", "nature"]),
  alt: z.string().min(1).max(300),
  camera: z.string().min(1).max(120),
  lens: z.string().min(1).max(120),
  settings: z.string().min(1).max(200),
  recipe: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  date: isoDate,
});
export type PhotoEntryInput = z.infer<typeof photoEntrySchema>;

export const photoEntriesSchema = z.array(photoEntrySchema).min(1).max(20);

export const nowContentSchema = z.object({
  lastUpdated: isoDate,
  location: z.object({ label: z.string().min(1).max(120), detail: z.string().min(1).max(300) }),
  building: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        href: z.string().min(1).max(300),
        note: z.string().min(1).max(500),
      })
    )
    .max(12),
  thinkingAbout: z.array(z.string().min(1).max(500)).max(12),
});

export const linksContentSchema = z.record(
  z.string().min(1).max(60),
  z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(500),
    links: z
      .array(
        z.object({
          title: z.string().min(1).max(200),
          link: z.string().url(),
          linkDescription: z.string().min(1).max(500),
          rss: z.string().url().optional(),
        })
      )
      .max(100),
  })
);
```

- [ ] **Step 5:** Tests pass; typecheck clean.
- [ ] **Step 6:** Commit: `feat(admin): blog content generation, meta round-trip, publish schemas`

### Task 7: OAuth routes (login / callback / logout)

**Files:**
- Create: `src/app/api/admin/auth/login/route.ts`, `src/app/api/admin/auth/callback/route.ts`, `src/app/api/admin/auth/logout/route.ts`
- Test: `src/__tests__/api/admin-auth.test.ts`

**Interfaces:** Consumes `createSessionToken`, `isAdminConfigured`, `ADMIN_SESSION_COOKIE` from Task 4. Cookie `admin_oauth_state` (10 min) carries the OAuth state.

- [ ] **Step 1: Failing tests** `src/__tests__/api/admin-auth.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/with-rate-limit", () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
  RATE_LIMITS: { STANDARD: { limit: 30, window: 60000 }, NEWSLETTER: { limit: 3, window: 300000 } },
}));
vi.mock("@/lib/csrf", () => ({ validateCsrf: vi.fn(() => null) }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn(), logInfo: vi.fn() }));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function setEnv() {
  process.env.GITHUB_OAUTH_CLIENT_ID = "cid";
  process.env.GITHUB_OAUTH_CLIENT_SECRET = "csecret";
  process.env.ADMIN_SESSION_SECRET = "test-secret";
  process.env.ADMIN_ALLOWED_LOGIN = "gr8monk3ys";
  process.env.GITHUB_CONTENT_TOKEN = "tok";
}

beforeEach(() => {
  fetchMock.mockReset();
  setEnv();
});

describe("GET /api/admin/auth/login", () => {
  it("redirects to GitHub with client_id and state cookie", async () => {
    const { GET } = await import("@/app/api/admin/auth/login/route");
    const res = await GET(new NextRequest("https://example.com/api/admin/auth/login"));
    expect(res.status).toBe(307);
    const location = res.headers.get("location") || "";
    expect(location).toContain("github.com/login/oauth/authorize");
    expect(location).toContain("client_id=cid");
    expect(res.headers.get("set-cookie")).toContain("admin_oauth_state=");
  });
});

describe("GET /api/admin/auth/callback", () => {
  function callbackRequest(state: string, cookieState: string): NextRequest {
    return new NextRequest(
      `https://example.com/api/admin/auth/callback?code=thecode&state=${state}`,
      { headers: { cookie: `admin_oauth_state=${cookieState}` } }
    );
  }

  it("sets a session for the allow-listed login", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "at" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ login: "gr8monk3ys" }), { status: 200 }));
    const { GET } = await import("@/app/api/admin/auth/callback/route");
    const res = await GET(callbackRequest("abc", "abc"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin");
    expect(res.headers.get("set-cookie")).toContain("admin_session=");
  });

  it("rejects a login not on the allowlist", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "at" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ login: "mallory" }), { status: 200 }));
    const { GET } = await import("@/app/api/admin/auth/callback/route");
    const res = await GET(callbackRequest("abc", "abc"));
    expect(res.headers.get("location")).toContain("error=denied");
    expect(res.headers.get("set-cookie") || "").not.toContain("admin_session=");
  });

  it("rejects a state mismatch", async () => {
    const { GET } = await import("@/app/api/admin/auth/callback/route");
    const res = await GET(callbackRequest("abc", "different"));
    expect(res.headers.get("location")).toContain("error=state");
  });
});
```

- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3: Implement.** First add to `src/lib/admin/session.ts` (Next.js route files may only export HTTP handlers + segment config, so the constant lives in the lib):

```ts
export const OAUTH_STATE_COOKIE = "admin_oauth_state";
```

`login/route.ts`:

```ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { isAdminConfigured, OAUTH_STATE_COOKIE } from "@/lib/admin/session";

async function handler(req: NextRequest): Promise<NextResponse> {
  if (!isAdminConfigured()) {
    return NextResponse.redirect(new URL("/admin/login?error=unconfigured", req.url));
  }
  const state = crypto.randomBytes(16).toString("hex");
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", process.env.GITHUB_OAUTH_CLIENT_ID as string);
  authorize.searchParams.set("redirect_uri", new URL("/api/admin/auth/callback", req.url).toString());
  authorize.searchParams.set("state", state);
  const res = NextResponse.redirect(authorize);
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}

export const GET = withRateLimit(handler, RATE_LIMITS.NEWSLETTER);
```

`callback/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import {
  ADMIN_SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
  createSessionToken,
  isAdminConfigured,
} from "@/lib/admin/session";

function loginRedirect(req: NextRequest, error: string): NextResponse {
  const res = NextResponse.redirect(new URL(`/admin/login?error=${error}`, req.url));
  res.cookies.delete(OAUTH_STATE_COOKIE);
  return res;
}

async function handler(req: NextRequest): Promise<NextResponse> {
  if (!isAdminConfigured()) return loginRedirect(req, "unconfigured");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return loginRedirect(req, "state");
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenData.access_token) return loginRedirect(req, "exchange");

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = (await userRes.json()) as { login?: string };
    const allowed = process.env.ADMIN_ALLOWED_LOGIN || "gr8monk3ys";
    if (!userRes.ok || !user.login || user.login.toLowerCase() !== allowed.toLowerCase()) {
      return loginRedirect(req, "denied");
    }

    const res = NextResponse.redirect(new URL("/admin", req.url));
    res.cookies.delete(OAUTH_STATE_COOKIE);
    res.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(user.login), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (error) {
    logError("Admin OAuth callback failed", error, { component: "admin-auth", action: "callback" });
    return loginRedirect(req, "exchange");
  }
}

export const GET = withRateLimit(handler, RATE_LIMITS.NEWSLETTER);
```

`logout/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session";

async function handler(req: NextRequest): Promise<NextResponse> {
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;
  const res = NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
  res.cookies.delete(ADMIN_SESSION_COOKIE);
  return res;
}

export const POST = withRateLimit(handler, RATE_LIMITS.STANDARD);
```

- [ ] **Step 4:** Tests pass.
- [ ] **Step 5:** Commit: `feat(admin): GitHub OAuth login, callback with allowlist, logout`

### Task 8: Publish API routes

**Files:**
- Create: `src/app/api/admin/posts/route.ts`, `src/app/api/admin/photos/route.ts`, `src/app/api/admin/data/now/route.ts`, `src/app/api/admin/data/links/route.ts`, `src/lib/admin/images.ts`
- Test: `src/__tests__/api/admin-posts.test.ts`, `src/__tests__/api/admin-photos.test.ts`, `src/__tests__/api/admin-data.test.ts`

**Interfaces:**
- Consumes: `requireAdmin` (Task 4), `getFile`/`commitToMain` (Task 5), Task 6 content helpers + schemas.
- Produces (`images.ts`): `export async function toWebp(input: Buffer): Promise<{ data: Buffer; aspectRatio: "square" | "portrait" | "landscape" }>` — sharp: resize width 1920 `withoutEnlargement`, webp q85; ratio > 1.15 landscape, < 0.87 portrait, else square.
- Success responses: `apiSuccess({ commitUrl, path })` for posts; `apiSuccess({ commitUrl, added })` for photos; `apiSuccess({ commitUrl })` for now/links. GET on now/links returns `apiSuccess(content)` fetched from GitHub.

- [ ] **Step 1: Failing route tests.** `src/__tests__/api/admin-posts.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/with-rate-limit", () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
  RATE_LIMITS: { STANDARD: { limit: 30, window: 60000 } },
}));
vi.mock("@/lib/csrf", () => ({ validateCsrf: vi.fn(() => null) }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn(), logInfo: vi.fn() }));

const getFile = vi.fn();
const commitToMain = vi.fn();
const listBlogSlugs = vi.fn();
vi.mock("@/lib/admin/github", () => ({
  getFile: (...args: unknown[]) => getFile(...args),
  commitToMain: (...args: unknown[]) => commitToMain(...args),
  listBlogSlugs: (...args: unknown[]) => listBlogSlugs(...args),
}));

function setEnv() {
  process.env.GITHUB_OAUTH_CLIENT_ID = "cid";
  process.env.GITHUB_OAUTH_CLIENT_SECRET = "cs";
  process.env.ADMIN_SESSION_SECRET = "test-secret";
  process.env.ADMIN_ALLOWED_LOGIN = "gr8monk3ys";
  process.env.GITHUB_CONTENT_TOKEN = "tok";
}

async function authedRequest(body: unknown): Promise<NextRequest> {
  const { createSessionToken } = await import("@/lib/admin/session");
  return new NextRequest("https://example.com/api/admin/posts", {
    method: "POST",
    headers: { cookie: `admin_session=${createSessionToken("gr8monk3ys")}` },
    body: JSON.stringify(body),
  });
}

const validPost = {
  title: "A New Post",
  slug: "a-new-post",
  description: "Testing publish.",
  date: "2026-08-14",
  tags: ["testing"],
  body: "## Hello\n\nWorld.",
};

beforeEach(() => {
  vi.clearAllMocks();
  setEnv();
  commitToMain.mockResolvedValue({ sha: "abc", url: "https://github.com/o/r/commit/abc" });
  getFile.mockResolvedValue(null);
});

describe("POST /api/admin/posts", () => {
  it("401s without a session", async () => {
    const { POST } = await import("@/app/api/admin/posts/route");
    const res = await POST(
      new NextRequest("https://example.com/api/admin/posts", {
        method: "POST",
        body: JSON.stringify(validPost),
      })
    );
    expect(res.status).toBe(401);
  });

  it("rejects invalid meta with 400", async () => {
    const { POST } = await import("@/app/api/admin/posts/route");
    const res = await POST(await authedRequest({ ...validPost, date: "August 14" }));
    expect(res.status).toBe(400);
  });

  it("rejects broken MDX with 400 and does not commit", async () => {
    const { POST } = await import("@/app/api/admin/posts/route");
    const res = await POST(await authedRequest({ ...validPost, body: "<Unclosed" }));
    expect(res.status).toBe(400);
    expect(commitToMain).not.toHaveBeenCalled();
  });

  it("409s when the slug exists and overwrite is false", async () => {
    getFile.mockResolvedValueOnce({ text: "existing", sha: "s" });
    const { POST } = await import("@/app/api/admin/posts/route");
    const res = await POST(await authedRequest(validPost));
    expect(res.status).toBe(409);
  });

  it("commits content.mdx and page.tsx on create", async () => {
    const { POST } = await import("@/app/api/admin/posts/route");
    const res = await POST(await authedRequest(validPost));
    expect(res.status).toBe(200);
    const [files, message] = commitToMain.mock.calls[0] as [Array<{ path: string }>, string];
    expect(files.map((f) => f.path)).toEqual([
      "src/app/blog/a-new-post/content.mdx",
      "src/app/blog/a-new-post/page.tsx",
    ]);
    expect(message).toContain("a-new-post");
  });

  it("commits only content.mdx on overwrite", async () => {
    getFile.mockResolvedValueOnce({ text: "existing", sha: "s" });
    const { POST } = await import("@/app/api/admin/posts/route");
    const res = await POST(await authedRequest({ ...validPost, overwrite: true }));
    expect(res.status).toBe(200);
    const [files] = commitToMain.mock.calls[0] as [Array<{ path: string }>];
    expect(files.map((f) => f.path)).toEqual(["src/app/blog/a-new-post/content.mdx"]);
  });
});
```

`src/__tests__/api/admin-data.test.ts` (same mock preamble minus `listBlogSlugs`; import PUT/GET from the two data routes):

```ts
// ...same vi.mock preamble and setEnv/authedRequest helper (URL and method PUT) as admin-posts.test.ts...

const validNow = {
  lastUpdated: "2026-08-14",
  location: { label: "SoCal", detail: "Remote." },
  building: [{ title: "T", href: "/x", note: "n" }],
  thinkingAbout: ["thing"],
};

describe("PUT /api/admin/data/now", () => {
  it("401s without a session", async () => {
    const { PUT } = await import("@/app/api/admin/data/now/route");
    const res = await PUT(
      new NextRequest("https://example.com/api/admin/data/now", {
        method: "PUT",
        body: JSON.stringify(validNow),
      })
    );
    expect(res.status).toBe(401);
  });

  it("rejects a malformed body", async () => {
    const { PUT } = await import("@/app/api/admin/data/now/route");
    const res = await PUT(await authedRequest({ nope: true }, "data/now", "PUT"));
    expect(res.status).toBe(400);
  });

  it("commits src/data/now.json", async () => {
    const { PUT } = await import("@/app/api/admin/data/now/route");
    const res = await PUT(await authedRequest(validNow, "data/now", "PUT"));
    expect(res.status).toBe(200);
    const [files] = commitToMain.mock.calls[0] as [Array<{ path: string; content: string }>];
    expect(files[0].path).toBe("src/data/now.json");
    expect(JSON.parse(files[0].content)).toEqual(validNow);
  });
});

describe("GET /api/admin/data/links", () => {
  it("returns the parsed file from GitHub", async () => {
    getFile.mockResolvedValueOnce({ text: JSON.stringify({ docs: { title: "D", description: "d", links: [] } }), sha: "s" });
    const { GET } = await import("@/app/api/admin/data/links/route");
    const res = await GET(await authedRequest(undefined, "data/links", "GET"));
    const body = (await res.json()) as { data: { docs: { title: string } } };
    expect(body.data.docs.title).toBe("D");
  });
});
```

`src/__tests__/api/admin-photos.test.ts` (mock `@/lib/admin/github` as above; use sharp for real on a generated buffer):

```ts
// ...same mock preamble...
import sharp from "sharp";

async function pngBuffer(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 10, g: 20, b: 30 } } })
    .png()
    .toBuffer();
}

describe("POST /api/admin/photos", () => {
  it("processes uploads and appends entries to photos.json in one commit", async () => {
    getFile.mockResolvedValueOnce({ text: "[]", sha: "s" }); // current photos.json
    const form = new FormData();
    form.append(
      "entries",
      JSON.stringify([
        {
          filename: "sunset.png",
          category: "travel",
          alt: "Sunset over the bay",
          camera: "X-T5",
          lens: "23mm f/2",
          settings: "f/8 1/250 ISO 200",
          date: "2026-08-14",
        },
      ])
    );
    form.append("files", new File([await pngBuffer(400, 200)], "sunset.png", { type: "image/png" }));
    const { createSessionToken } = await import("@/lib/admin/session");
    const req = new NextRequest("https://example.com/api/admin/photos", {
      method: "POST",
      headers: { cookie: `admin_session=${createSessionToken("gr8monk3ys")}` },
      body: form,
    });
    const { POST } = await import("@/app/api/admin/photos/route");
    const res = await POST(req);
    expect(res.status).toBe(200);
    const [files] = commitToMain.mock.calls[0] as [Array<{ path: string; content: Buffer | string }>];
    expect(files.map((f) => f.path)).toEqual([
      "public/images/photos/travel/sunset.webp",
      "src/data/photos.json",
    ]);
    const entries = JSON.parse(files[1].content as string) as Array<{ aspectRatio: string; src: string }>;
    expect(entries[0].aspectRatio).toBe("landscape");
    expect(entries[0].src).toBe("/images/photos/travel/sunset.webp");
  });
});
```

- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3: Implement** `src/lib/admin/images.ts`:

```ts
import sharp from "sharp";

export async function toWebp(
  input: Buffer
): Promise<{ data: Buffer; aspectRatio: "square" | "portrait" | "landscape" }> {
  const pipeline = sharp(input).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 85 });
  const data = await pipeline.toBuffer();
  const { width = 1, height = 1 } = await sharp(data).metadata();
  const ratio = width / height;
  const aspectRatio = ratio > 1.15 ? "landscape" : ratio < 0.87 ? "portrait" : "square";
  return { data, aspectRatio };
}
```

`posts/route.ts` (POST — the fields flow: validate → MDX check → collision check → build files → commit):

```ts
import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { parseBody } from "@/lib/validations";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin/session";
import { getFile, commitToMain, type CommitFile } from "@/lib/admin/github";
import { postPublishSchema } from "@/lib/admin/schemas";
import {
  buildContentMdx,
  buildPageTsx,
  validateMdx,
  type PostMeta,
} from "@/lib/admin/blog-content";
import { toWebp } from "@/lib/admin/images";

async function handler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const parsed = parseBody(postPublishSchema, await req.json());
    if (!parsed.success) return ApiErrors.badRequest(parsed.error);
    const input = parsed.data;

    const contentPath = `src/app/blog/${input.slug}/content.mdx`;
    const existing = await getFile(contentPath);
    if (existing && !input.overwrite) {
      return ApiErrors.conflict(`A post with slug "${input.slug}" already exists`);
    }
    if (!existing && input.overwrite) {
      return ApiErrors.notFound(`No post with slug "${input.slug}" to update`);
    }

    const files: CommitFile[] = [];
    const meta: PostMeta = {
      title: input.title,
      description: input.description,
      date: input.date,
      tags: input.tags,
      series: input.series,
      seriesOrder: input.seriesOrder,
      stage: input.stage as PostMeta["stage"],
    };
    if (input.coverImage) {
      const base64 = input.coverImage.slice(input.coverImage.indexOf(",") + 1);
      const { data } = await toWebp(Buffer.from(base64, "base64"));
      files.push({ path: `public/images/blog/${input.slug}.webp`, content: data });
      meta.image = `/images/blog/${input.slug}.webp`;
    }

    const mdx = buildContentMdx(meta, input.body);
    const mdxCheck = await validateMdx(mdx);
    if (!mdxCheck.ok) return ApiErrors.badRequest(`MDX does not compile: ${mdxCheck.error}`);

    files.unshift({ path: contentPath, content: mdx });
    if (!existing) {
      files.splice(1, 0, { path: `src/app/blog/${input.slug}/page.tsx`, content: buildPageTsx(input.slug) });
    }

    const verb = existing ? "update" : "add";
    const commit = await commitToMain(files, `content(blog): ${verb} ${input.slug} via portal`);
    return apiSuccess({ commitUrl: commit.url, path: `/blog/${input.slug}` });
  } catch (error) {
    logError("Admin post publish failed", error, { component: "admin-posts", action: "POST" });
    return ApiErrors.internalError("Publish failed — nothing was committed");
  }
}

export const POST = withRateLimit(handler, RATE_LIMITS.STANDARD);
```

(Note the ordering fix: cover image is processed before `buildContentMdx` so `meta.image` lands in the mdx; `files` ends as `[content.mdx, page.tsx?, cover?]` — the test asserts the first two paths with no cover, and `expect(files.map(...)).toEqual([...])` must match implementation order; keep content.mdx first, page.tsx second, cover last.)

`photos/route.ts`:

```ts
import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin/session";
import { getFile, commitToMain, type CommitFile } from "@/lib/admin/github";
import { photoEntriesSchema } from "@/lib/admin/schemas";
import { slugify } from "@/lib/admin/blog-content";
import { toWebp } from "@/lib/admin/images";
import type { Photo } from "@/constants/photos";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

async function handler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const form = await req.formData();
    const entriesRaw = form.get("entries");
    if (typeof entriesRaw !== "string") return ApiErrors.missingField("entries");
    const parsed = photoEntriesSchema.safeParse(JSON.parse(entriesRaw));
    if (!parsed.success) return ApiErrors.badRequest(parsed.error.issues[0]?.message || "Invalid entries");
    const entries = parsed.data;

    const uploads = form.getAll("files").filter((f): f is File => f instanceof File);
    if (uploads.length !== entries.length) {
      return ApiErrors.badRequest("Each uploaded file needs exactly one metadata entry");
    }

    const current = await getFile("src/data/photos.json");
    const photos = JSON.parse(current?.text ?? "[]") as Photo[];

    const files: CommitFile[] = [];
    const added: string[] = [];
    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      const entry = entries[i];
      if (upload.size > MAX_UPLOAD_BYTES) {
        return ApiErrors.badRequest(`${upload.name} exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`);
      }
      const base = slugify(entry.filename.replace(/\.[^.]+$/, ""));
      const src = `/images/photos/${entry.category}/${base}.webp`;
      if (photos.some((p) => p.src === src)) {
        return ApiErrors.conflict(`${src} already exists in the gallery`);
      }
      const { data, aspectRatio } = await toWebp(Buffer.from(await upload.arrayBuffer()));
      files.push({ path: `public/images/photos/${entry.category}/${base}.webp`, content: data });
      photos.push({
        id: `${entry.category}-${base}`,
        src,
        alt: entry.alt,
        category: entry.category,
        camera: entry.camera,
        lens: entry.lens,
        settings: entry.settings,
        recipe: entry.recipe,
        location: entry.location,
        date: entry.date,
        aspectRatio,
      });
      added.push(src);
    }
    files.push({ path: "src/data/photos.json", content: `${JSON.stringify(photos, null, 2)}\n` });

    const commit = await commitToMain(files, `content(photos): add ${added.length} photo(s) via portal`);
    return apiSuccess({ commitUrl: commit.url, added });
  } catch (error) {
    logError("Admin photo publish failed", error, { component: "admin-photos", action: "POST" });
    return ApiErrors.internalError("Publish failed — nothing was committed");
  }
}

export const POST = withRateLimit(handler, RATE_LIMITS.STANDARD);
```

(Note: `JSON.stringify(photos)` keeps `recipe`/`location` keys only when defined — `undefined` is dropped, matching `Photo`'s optional fields. The test parses `files[1].content` — with a cover the photos.json is always last, index `files.length - 1`; write the test against the exact order `[image..., photos.json]` as shown.)

`data/now/route.ts` and `data/links/route.ts` share a small factory. Create both with this pattern (shown for `now`; `links` swaps schema `linksContentSchema`, path `src/data/links.json`, and message `content(links): update /links via portal`):

```ts
import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { parseBody } from "@/lib/validations";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin/session";
import { getFile, commitToMain } from "@/lib/admin/github";
import { nowContentSchema } from "@/lib/admin/schemas";

const FILE_PATH = "src/data/now.json";

async function getHandler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  try {
    const file = await getFile(FILE_PATH);
    if (!file) return ApiErrors.notFound(`${FILE_PATH} not found on main`);
    return apiSuccess(JSON.parse(file.text));
  } catch (error) {
    logError("Admin now fetch failed", error, { component: "admin-data", action: "GET" });
    return ApiErrors.internalError("Could not load current content");
  }
}

async function putHandler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;
  try {
    const parsed = parseBody(nowContentSchema, await req.json());
    if (!parsed.success) return ApiErrors.badRequest(parsed.error);
    const commit = await commitToMain(
      [{ path: FILE_PATH, content: `${JSON.stringify(parsed.data, null, 2)}\n` }],
      "content(now): update /now via portal"
    );
    return apiSuccess({ commitUrl: commit.url });
  } catch (error) {
    logError("Admin now publish failed", error, { component: "admin-data", action: "PUT" });
    return ApiErrors.internalError("Publish failed — nothing was committed");
  }
}

export const GET = withRateLimit(getHandler, RATE_LIMITS.STANDARD);
export const PUT = withRateLimit(putHandler, RATE_LIMITS.STANDARD);
```

- [ ] **Step 4:** All three test files pass; typecheck + lint clean.
- [ ] **Step 5:** Commit: `feat(admin): publish APIs for posts, photos, now, and links`

### Task 9: Admin UI

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/(protected)/layout.tsx`, `src/app/admin/(protected)/page.tsx`, `src/app/admin/(protected)/posts/page.tsx`, `src/app/admin/(protected)/posts/new/page.tsx`, `src/app/admin/(protected)/posts/[slug]/page.tsx`, `src/app/admin/(protected)/photos/page.tsx`, `src/app/admin/(protected)/now/page.tsx`, `src/app/admin/(protected)/links/page.tsx`
- Create (client components): `src/components/admin/post-editor.tsx`, `src/components/admin/photos-uploader.tsx`, `src/components/admin/json-editor-form.tsx`, `src/components/admin/publish-result.tsx`
- Test: `e2e/admin.spec.ts`

**Interfaces:** Consumes `getServerSession`/`isAdminConfigured` (Task 4), `listBlogSlugs`/`getFile` (Task 5), `parseMeta`/`extractBody` (Task 6). Client components POST/PUT to Task 8 routes with `credentials: "same-origin"` (default) and read the `{ data, success }` envelope.

Implementation notes (complete files are written at implementation time following these exact structures — plain Tailwind, no new deps):

- `admin/layout.tsx` (server): wraps children in a `max-w-4xl mx-auto px-6 py-12` container; exports `metadata = { title: "Admin", robots: { index: false, follow: false } }`.
- `login/page.tsx` (server): if `!isAdminConfigured()` render a paragraph explaining which env vars are missing conceptually ("The portal is not configured on this deployment"); else an `<a href="/api/admin/auth/login">` button "Sign in with GitHub" plus an error message map for `?error=state|denied|exchange|unconfigured` via `searchParams`.
- `(protected)/layout.tsx` (server): `const session = await getServerSession(); if (!session) redirect("/admin/login");` then render children with a header showing `session.login` and a logout `<form method="post" action="/api/admin/auth/logout">`.
- `(protected)/page.tsx`: four cards linking to `/admin/posts`, `/admin/photos`, `/admin/now`, `/admin/links`.
- `(protected)/posts/page.tsx` (server): `const slugs = await listBlogSlugs()` in a try/catch (on error render the message); list links to `/admin/posts/{slug}` + a "New post" button → `/admin/posts/new`.
- `(protected)/posts/new/page.tsx`: renders `<PostEditor />`.
- `(protected)/posts/[slug]/page.tsx` (server): fetch `src/app/blog/{slug}/content.mdx` via `getFile`; `parseMeta`/`extractBody`; if meta parses, render `<PostEditor initial={{...meta, slug, body}} />`; if not, render `<PostEditor initial={{ slug, raw: text }} rawMode />` (raw mode = single textarea for the whole file, submitted with `overwrite: true` and meta parsed server-side? No — raw mode posts are rejected client-side with a note to edit in the repo; keep v1 honest and simple).
- `post-editor.tsx` (`"use client"`): controlled form — title (auto-fills slug via `slugify` logic duplicated inline as a simple regex; slug editable until first publish), description, date (`<input type="date">`), tags (comma-separated text input, split/trimmed), series, seriesOrder, stage (`<select>` from `BLOG_STAGES`), cover image (`<input type="file" accept="image/*">` → `FileReader.readAsDataURL`), body (`<textarea rows={24} className="font-mono">`). Submit → `POST /api/admin/posts` with `overwrite: Boolean(initial)`; render `<PublishResult />` with commit link + `/blog/{slug}` link on success, error text on failure. Disable the button while in flight.
- `photos-uploader.tsx` (`"use client"`): `<input type="file" multiple accept="image/*">`; per selected file a fieldset (category select, alt, camera, lens, settings, recipe, location, date defaulting to today); submit builds `FormData` (`entries` JSON + `files`), POSTs, shows `<PublishResult />`.
- `now/page.tsx` + `links/page.tsx` (server): fetch current content via `getFile` and pass as `initial` to `json-editor-form.tsx` (`"use client"`), which renders structured fields: for now — location label/detail inputs, building list (title/href/note per row, add/remove buttons), thinkingAbout list (textarea per row, add/remove); `lastUpdated` is set to today's date automatically on submit. For links — a section list with per-section link rows and add/remove. One shared component parameterized by a small field config would over-abstract; write `now-editor.tsx` and `links-editor.tsx` as separate components if `json-editor-form.tsx` gets tangled — prefer two simple components over one clever one.
- `publish-result.tsx`: props `{ state: "idle" | "saving" } | { state: "done"; commitUrl: string; viewPath?: string } | { state: "error"; message: string }`; "done" renders "Committed — live in ~2 minutes once Vercel deploys" with the commit link.

- [ ] **Step 1:** Build the pages/components per the notes above. `npm run typecheck && npm run lint` clean.
- [ ] **Step 2:** e2e `e2e/admin.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("unauthenticated /admin lands on login, not the dashboard", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.locator("body")).not.toContainText("New post");
});

test("admin pages are noindex", async ({ page }) => {
  await page.goto("/admin/login");
  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /noindex/);
});
```

- [ ] **Step 3:** Confirm `rg -i admin src/app/sitemap.ts` shows the sitemap does not include `/admin` (it enumerates known routes; if `/admin` would be picked up, exclude it).
- [ ] **Step 4:** Commit: `feat(admin): portal UI — dashboard, post editor, photo uploader, now/links editors`

### Task 10: Env + docs

**Files:**
- Modify: `.env.example`, `docs/operations.md`

- [ ] **Step 1:** Append to `.env.example`:

```bash
# Admin portal (all five required for /admin to function)
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
ADMIN_ALLOWED_LOGIN=gr8monk3ys
ADMIN_SESSION_SECRET=
GITHUB_CONTENT_TOKEN=
# Optional, defaults to gr8monk3ys/lscaturchio.xyz
# GITHUB_CONTENT_REPO=
```

- [ ] **Step 2:** Add a "Publishing via the admin portal" section to `docs/operations.md`: what the portal does (commits to main; Vercel deploys), creating the GitHub OAuth app (callback URL `https://lscaturchio.xyz/api/admin/auth/callback`), creating the fine-grained PAT (this repo only, Contents read/write), generating `ADMIN_SESSION_SECRET` (`openssl rand -hex 32`), setting the five vars in Vercel, failure modes (broken MDX rejected at publish; failed build leaves previous deploy live), and PAT rotation.
- [ ] **Step 3:** Commit: `docs: admin portal setup and operations`

### Task 11: Verification (/go phase 1), simplify, PR

- [ ] **Step 1:** Full suite: `npm run lint && npm run typecheck && npm test -- --run` — all green (paste output).
- [ ] **Step 2:** `npm run build` — clean production build with admin env unset (proves graceful degradation at build time).
- [ ] **Step 3:** Boot `npm run dev` with test env vars set (`ADMIN_SESSION_SECRET=dev-secret GITHUB_OAUTH_CLIENT_ID=x GITHUB_OAUTH_CLIENT_SECRET=x GITHUB_CONTENT_TOKEN=x`). In a browser (Chrome tools/Playwright): `/admin` redirects to `/admin/login`; login page renders the GitHub button; forge a session cookie (`createSessionToken` via a scratch script) and verify the dashboard, post editor, photos uploader, and now/links editors all render; submit an invalid post and see the validation error. Screenshot the dashboard and post editor.
- [ ] **Step 4:** Verify `/now`, `/links`, `/photos` pages render identically to production content after the JSON refactor.
- [ ] **Step 5:** State explicitly what was NOT verified live: the real GitHub OAuth round-trip and a real commit to main (both need the OAuth app + PAT to exist — owner setup).
- [ ] **Step 6:** Run the `simplify` skill on the branch diff; apply what it finds.
- [ ] **Step 7:** `git push -u origin feat/admin-portal`; `gh pr create` — body: what changed, verification evidence (commands + results, screenshots), what was not verified, and the owner setup checklist (OAuth app, PAT, Vercel env vars). Not a draft.
