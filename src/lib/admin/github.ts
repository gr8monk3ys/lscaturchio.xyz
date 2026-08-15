/**
 * Minimal GitHub content client for the admin portal.
 *
 * Publishing works by committing generated files straight to main via the
 * git data API (blobs -> tree -> commit -> ref), so multi-file changes land
 * atomically as a single commit and Vercel deploys once.
 */

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
    throw new Error(
      `GitHub ${init?.method || "GET"} ${path} failed (${res.status}): ${body.slice(0, 300)}`
    );
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

type TreeEntry = { path: string; mode: string; type: string; sha: string };

async function attemptCommit(
  tree: TreeEntry[],
  message: string
): Promise<{ sha: string; url: string } | null> {
  const ref = await ghJson<{ object: { sha: string } }>("/git/ref/heads/main");
  const headSha = ref.object.sha;
  const headCommit = await ghJson<{ tree: { sha: string } }>(`/git/commits/${headSha}`);

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
  // Blobs are content-addressed and independent of the head, so upload them
  // in parallel, once — a retry after a ref race must not re-send megabytes.
  const tree = await Promise.all(
    files.map(async (file): Promise<TreeEntry> => {
      const buffer = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content);
      const blob = await ghJson<{ sha: string }>("/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: buffer.toString("base64"), encoding: "base64" }),
      });
      return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
    })
  );

  const first = await attemptCommit(tree, message);
  if (first) return first;
  const second = await attemptCommit(tree, message);
  if (second) return second;
  throw new Error("GitHub commit failed twice: main moved during both attempts");
}
