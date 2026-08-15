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
vi.mock("@/lib/admin/github", () => ({
  getFile: (...args: unknown[]) => getFile(...args),
  commitToMain: (...args: unknown[]) => commitToMain(...args),
}));

function setEnv() {
  process.env.GITHUB_OAUTH_CLIENT_ID = "cid";
  process.env.GITHUB_OAUTH_CLIENT_SECRET = "cs";
  process.env.ADMIN_SESSION_SECRET = "test-secret";
  process.env.ADMIN_ALLOWED_LOGIN = "gr8monk3ys";
  process.env.GITHUB_CONTENT_TOKEN = "tok";
}

async function authedRequest(
  body: unknown,
  path: string,
  method: string
): Promise<NextRequest> {
  const { createSessionToken } = await import("@/lib/admin/session");
  const req = new NextRequest(`https://example.com/api/admin/${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  req.cookies.set("admin_session", createSessionToken("gr8monk3ys"));
  return req;
}

const validNow = {
  lastUpdated: "2026-08-14",
  location: { label: "SoCal", detail: "Remote." },
  building: [{ title: "T", href: "/x", note: "n" }],
  thinkingAbout: ["thing"],
};

beforeEach(() => {
  vi.clearAllMocks();
  setEnv();
  commitToMain.mockResolvedValue({ sha: "abc", url: "https://github.com/o/r/commit/abc" });
});

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
    getFile.mockResolvedValueOnce({
      text: JSON.stringify({ docs: { title: "D", description: "d", links: [] } }),
      sha: "s",
    });
    const { GET } = await import("@/app/api/admin/data/links/route");
    const res = await GET(await authedRequest(undefined, "data/links", "GET"));
    const body = (await res.json()) as { data: { docs: { title: string } } };
    expect(body.data.docs.title).toBe("D");
  });
});
