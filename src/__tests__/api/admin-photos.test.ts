import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import sharp from "sharp";

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

async function pngBuffer(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 10, g: 20, b: 30 } },
  })
    .png()
    .toBuffer();
}

beforeEach(() => {
  vi.clearAllMocks();
  setEnv();
  commitToMain.mockResolvedValue({ sha: "abc", url: "https://github.com/o/r/commit/abc" });
});

describe("POST /api/admin/photos", () => {
  it("401s without a session", async () => {
    const { POST } = await import("@/app/api/admin/photos/route");
    const res = await POST(
      new NextRequest("https://example.com/api/admin/photos", {
        method: "POST",
        body: new FormData(),
      })
    );
    expect(res.status).toBe(401);
  });

  it("processes uploads and appends entries to photos.json in one commit", async () => {
    getFile.mockResolvedValueOnce({ text: "[]", sha: "s" });
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
    form.append(
      "files",
      new File([new Uint8Array(await pngBuffer(400, 200))], "sunset.png", { type: "image/png" })
    );
    const { createSessionToken } = await import("@/lib/admin/session");
    const req = new NextRequest("https://example.com/api/admin/photos", {
      method: "POST",
      body: form,
    });
    req.cookies.set("admin_session", createSessionToken("gr8monk3ys"));
    const { POST } = await import("@/app/api/admin/photos/route");
    const res = await POST(req);
    expect(res.status).toBe(200);
    const [files] = commitToMain.mock.calls[0] as [
      Array<{ path: string; content: Buffer | string }>,
    ];
    expect(files.map((f) => f.path)).toEqual([
      "public/images/photos/travel/sunset.webp",
      "src/data/photos.json",
    ]);
    const entries = JSON.parse(files[1].content as string) as Array<{
      aspectRatio: string;
      src: string;
    }>;
    expect(entries[0].aspectRatio).toBe("landscape");
    expect(entries[0].src).toBe("/images/photos/travel/sunset.webp");
  });
});
