export type WebmentionType = "like" | "repost" | "reply" | "mention";

export interface WebmentionAuthor {
  name?: string;
  photo?: string;
  url?: string;
}

export interface WebmentionEntry {
  id: string;
  url: string;
  type: WebmentionType;
  published?: string;
  author?: WebmentionAuthor;
  contentText?: string;
}

export interface WebmentionsResponse {
  target: string;
  counts: Record<WebmentionType, number>;
  entries: WebmentionEntry[];
}

function toWebmentionType(wmProperty: unknown): WebmentionType {
  switch (wmProperty) {
    case "like-of":
      return "like";
    case "repost-of":
      return "repost";
    case "in-reply-to":
      return "reply";
    case "mention-of":
    default:
      return "mention";
  }
}

function safeString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v : undefined;
}

function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function isHttpUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Fetch webmentions for a given canonical target URL from webmention.io (public endpoint).
 *
 * Docs: https://webmention.io/
 */
export async function fetchWebmentions(target: string): Promise<WebmentionsResponse> {
  const endpoint = new URL("https://webmention.io/api/mentions.jf2");
  endpoint.searchParams.set("target", target);
  endpoint.searchParams.set("per-page", "100");

  const res = await fetch(endpoint.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    // Avoid long hangs on serverless
    signal: AbortSignal.timeout(10_000),
    // Let the route control caching semantics.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`webmention.io returned ${res.status}`);
  }

  const json = (await res.json()) as unknown;
  const children = safeArray<Record<string, unknown>>(
    typeof json === "object" && json !== null ? (json as { children?: unknown }).children : undefined
  );

  const entries: WebmentionEntry[] = [];
  for (const child of children) {
    const url = safeString(child.url);
    if (!isHttpUrl(url)) continue;

    const wmProperty = safeString(child["wm-property"]);
    const type = toWebmentionType(wmProperty);
    const published = safeString(child.published);

    const authorRaw =
      typeof child.author === "object" && child.author !== null
        ? (child.author as Record<string, unknown>)
        : undefined;

    const author: WebmentionAuthor | undefined = authorRaw
      ? {
          name: safeString(authorRaw.name),
          photo: safeString(authorRaw.photo),
          url: safeString(authorRaw.url),
        }
      : undefined;

    const contentRaw =
      typeof child.content === "object" && child.content !== null
        ? (child.content as Record<string, unknown>)
        : undefined;
    const contentText = safeString(contentRaw?.text ?? contentRaw?.value);

    const id = safeString(child["wm-id"]) ?? url;

    entries.push({
      id,
      url,
      type,
      published,
      author,
      contentText,
    });
  }

  const counts: Record<WebmentionType, number> = {
    like: 0,
    repost: 0,
    reply: 0,
    mention: 0,
  };

  for (const entry of entries) {
    counts[entry.type] += 1;
  }

  return { target, counts, entries };
}
