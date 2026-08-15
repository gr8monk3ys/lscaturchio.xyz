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
  // jsdom's Request drops the forbidden Cookie header, so set it directly.
  const req = new NextRequest("https://example.com/api/admin/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
  req.cookies.set("admin_session", createSessionToken("gr8monk3ys"));
  return req;
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
