"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Repeat2, MessageCircle, Link2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebmentionsResponse, WebmentionEntry, WebmentionType } from "@/lib/webmentions";

function typeLabel(type: WebmentionType): string {
  switch (type) {
    case "like":
      return "Likes";
    case "repost":
      return "Reposts";
    case "reply":
      return "Replies";
    case "mention":
      return "Mentions";
  }
}

function typeIcon(type: WebmentionType) {
  switch (type) {
    case "like":
      return Heart;
    case "repost":
      return Repeat2;
    case "reply":
      return MessageCircle;
    case "mention":
      return Link2;
  }
}

function sortByPublishedDesc(a: WebmentionEntry, b: WebmentionEntry): number {
  const da = a.published ? Date.parse(a.published) : 0;
  const db = b.published ? Date.parse(b.published) : 0;
  return db - da;
}

export function Webmentions({ path }: { path: string }) {
  const [data, setData] = useState<WebmentionsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setLoading(true);

    fetch(`/api/webmentions?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  const entries = data?.entries ?? [];
  const counts = data?.counts ?? { like: 0, repost: 0, reply: 0, mention: 0 };

  const replies = useMemo(
    () =>
      entries
        .filter((e) => e.type === "reply" && (e.contentText || e.author?.name))
        .sort(sortByPublishedDesc)
        .slice(0, 6),
    [entries]
  );

  const likes = useMemo(
    () => entries.filter((e) => e.type === "like").slice(0, 24),
    [entries]
  );

  const reposts = useMemo(
    () => entries.filter((e) => e.type === "repost").slice(0, 24),
    [entries]
  );

  const hasAnything = Object.values(counts).some((n) => n > 0);

  return (
    <section className="mt-12 pt-8 border-t border-border/60">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-foreground">Webmentions</h3>
        {loading && (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["like", "repost", "reply", "mention"] as const).map((type) => {
          const Icon = typeIcon(type);
          return (
            <div key={type} className="neu-flat-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                <span>{typeLabel(type)}</span>
              </div>
              <div className="mt-2 text-2xl font-bold tabular-nums">{counts[type]}</div>
            </div>
          );
        })}
      </div>

      {!loading && !hasAnything && (
        <div className="neu-flat rounded-2xl p-6 text-sm text-muted-foreground">
          No webmentions yet. When people like, repost, or reply to this page on the open web,
          they&apos;ll show up here.
        </div>
      )}

      {(likes.length > 0 || reposts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {likes.length > 0 && (
            <div className="neu-flat rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Likes</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {likes.map((e) => (
                  <Link
                    key={e.id}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex"
                    aria-label={e.author?.name ? `Like by ${e.author.name}` : "Like"}
                    title={e.author?.name ?? "Like"}
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-border/60 bg-muted">
                      {e.author?.photo ? (
                        <Image
                          src={e.author.photo}
                          alt={e.author.name ?? "Author avatar"}
                          fill
                          sizes="40px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-muted-foreground">
                          {(e.author?.name ?? "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {reposts.length > 0 && (
            <div className="neu-flat rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Repeat2 className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Reposts</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {reposts.map((e) => (
                  <Link
                    key={e.id}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex"
                    aria-label={e.author?.name ? `Repost by ${e.author.name}` : "Repost"}
                    title={e.author?.name ?? "Repost"}
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-border/60 bg-muted">
                      {e.author?.photo ? (
                        <Image
                          src={e.author.photo}
                          alt={e.author.name ?? "Author avatar"}
                          fill
                          sizes="40px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-muted-foreground">
                          {(e.author?.name ?? "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-6 neu-flat rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Replies</h4>
          </div>

          <div className="space-y-4">
            {replies.map((e) => (
              <article key={e.id} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {e.author?.name ?? "Someone"}
                    </div>
                    {e.published && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(e.published).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                  <Link
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "shrink-0 text-xs font-medium text-muted-foreground hover:text-primary transition-colors",
                      "inline-flex items-center gap-1"
                    )}
                  >
                    View <Link2 className="h-3 w-3" />
                  </Link>
                </div>
                {e.contentText && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed whitespace-pre-wrap">
                    {e.contentText}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

