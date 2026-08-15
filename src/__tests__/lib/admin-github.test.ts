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
      .mockResolvedValueOnce(jsonResponse(200, { tree: { sha: "basetree" } })) // head commit
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
