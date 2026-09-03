"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Link2 } from "lucide-react";
import type { WebmentionsResponse, WebmentionEntry, WebmentionType } from "@/lib/webmentions";
import useSWR from "swr";
import { fetchJson, type ApiEnvelope } from "@/lib/fetcher";

function typeLabel(type: WebmentionType, count: number): string {
  switch (type) {
    case "like":
      return count === 1 ? "like" : "likes";
    case "repost":
      return count === 1 ? "repost" : "reposts";
    case "reply":
      return count === 1 ? "reply" : "replies";
    case "mention":
      return count === 1 ? "mention" : "mentions";
  }
}

function sortByPublishedDesc(a: WebmentionEntry, b: WebmentionEntry): number {
  const da = a.published ? Date.parse(a.published) : 0;
  const db = b.published ? Date.parse(b.published) : 0;
  return db - da;
}

function Avatar({ entry }: { entry: WebmentionEntry }) {
  return (
    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border bg-muted">
      {entry.author?.photo ? (
        <Image
          src={entry.author.photo}
          alt={entry.author.name ?? "Author avatar"}
          fill
          sizes="32px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
          {(entry.author?.name ?? "?").slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}

/**
 * Responses from the open web. At zero this is one line, not four zero
 * tiles: the site says "nothing yet" the same way it does for music.
 */
export function Webmentions({ path }: { path: string }) {
  const requestUrl = path ? `/api/webmentions?path=${encodeURIComponent(path)}` : null;
  const { data, isLoading } = useSWR<ApiEnvelope<WebmentionsResponse>>(requestUrl, fetchJson, {
    revalidateOnFocus: false,
  });

  const entries = useMemo(() => data?.data?.entries ?? [], [data]);
  const counts = useMemo(
    () => data?.data?.counts ?? { like: 0, repost: 0, reply: 0, mention: 0 },
    [data]
  );

  const replies = useMemo(
    () =>
      entries
        .filter((e) => e.type === "reply" && (e.contentText || e.author?.name))
        .sort(sortByPublishedDesc)
        .slice(0, 6),
    [entries]
  );

  const reactions = useMemo(
    () => entries.filter((e) => e.type === "like" || e.type === "repost").slice(0, 24),
    [entries]
  );

  const hasAnything = Object.values(counts).some((n) => n > 0);

  const summary = (["like", "repost", "reply", "mention"] as const)
    .filter((type) => counts[type] > 0)
    .map((type) => `${counts[type]} ${typeLabel(type, counts[type])}`)
    .join(" · ");

  return (
    <section className="mt-12 border-t border-border pt-6" aria-label="Responses from the open web">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="label-mono">From the open web</span>
        {isLoading ? (
          <span className="label-mono normal-case tracking-normal text-muted-foreground" aria-live="polite">
            Checking…
          </span>
        ) : hasAnything ? (
          <span className="label-mono normal-case tracking-normal text-foreground/70">{summary}</span>
        ) : null}
      </div>

      {!isLoading && !hasAnything && (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          No mentions yet. Reply to this essay from your own site and it will show up here.
        </p>
      )}

      {reactions.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Likes and reposts">
          {reactions.map((e) => (
            <li key={e.id}>
              <Link
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={`${e.type === "like" ? "Like" : "Repost"}${e.author?.name ? ` by ${e.author.name}` : ""}`}
                title={e.author?.name ?? undefined}
              >
                <Avatar entry={e} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {replies.length > 0 && (
        <ol className="mt-4 border-t border-border">
          {replies.map((e) => (
            <li key={e.id} className="border-b border-border py-4">
              <div className="flex items-start gap-3">
                <Avatar entry={e} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="truncate text-sm font-medium text-foreground">
                      {e.author?.name ?? "Someone"}
                    </span>
                    <span className="label-mono flex items-center gap-3">
                      {e.published && (
                        <time dateTime={e.published}>
                          {new Date(e.published).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      )}
                      <Link
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                      >
                        Source <Link2 className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </span>
                  </div>
                  {e.contentText && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {e.contentText}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
