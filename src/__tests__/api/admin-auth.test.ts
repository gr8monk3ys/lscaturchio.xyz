import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/with-rate-limit", () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
  RATE_LIMITS: {
    STANDARD: { limit: 30, window: 60000 },
    NEWSLETTER: { limit: 3, window: 300000 },
  },
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
    // jsdom's Request drops the forbidden Cookie header, so set it directly.
    const req = new NextRequest(
      `https://example.com/api/admin/auth/callback?code=thecode&state=${state}`
    );
    req.cookies.set("admin_oauth_state", cookieState);
    return req;
  }

  it("sets a session for the allow-listed login", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "at" }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ login: "gr8monk3ys" }), { status: 200 })
      );
    const { GET } = await import("@/app/api/admin/auth/callback/route");
    const res = await GET(callbackRequest("abc", "abc"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin");
    expect(res.headers.get("set-cookie")).toContain("admin_session=");
  });

  it("rejects a login not on the allowlist", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "at" }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ login: "mallory" }), { status: 200 })
      );
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
