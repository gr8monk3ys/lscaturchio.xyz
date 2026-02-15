"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Compass, User, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/reveal";
import { getTopicHubsForTags } from "@/constants/topics";
import { logError } from "@/lib/logger";

export function NewHereSection() {
  const [lastRead, setLastRead] = useState<{
    slug: string;
    title?: string;
    tags?: string[];
  } | null>(null);
  const [lastReadProgress, setLastReadProgress] = useState<number | null>(null);
  const [popular, setPopular] = useState<Array<{ slug: string; title: string; views: number }>>([]);

  useEffect(() => {
    // Personalization from local reading history (stored on blog pages).
    try {
      const raw = localStorage.getItem("reading_history_v1");
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{
          slug: string;
          title?: string;
          tags?: string[];
          lastRead?: string;
        }>;
        const first = parsed?.[0];
        if (first?.slug) {
          setLastRead({ slug: first.slug, title: first.title, tags: first.tags });
          const progressRaw = localStorage.getItem(`reading_progress_${first.slug}`);
          if (progressRaw) {
            try {
              const progressParsed = JSON.parse(progressRaw) as { progress?: number };
              const p = Number(progressParsed?.progress);
              if (Number.isFinite(p)) {
                setLastReadProgress(Math.max(0, Math.min(100, Math.round(p))));
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch {
      // Ignore storage errors.
    }

    // Popular posts (views-based) to give new visitors a good entry point.
    const fetchPopular = async () => {
      try {
        const res = await fetch("/api/popular-posts?limit=3");
        if (!res.ok) return;
        const json = await res.json();
        const posts = (json.posts as Array<{ slug: string; title: string; views: number }> | undefined) ?? [];
        setPopular(posts.filter((p) => !!p?.slug && !!p?.title));
      } catch (error) {
        logError("Failed to fetch popular posts", error, { component: "NewHereSection" });
      }
    };

    fetchPopular();
  }, []);

  const returning = !!lastRead;
  const recommendedHub = useMemo(() => {
    if (!lastRead?.tags || lastRead.tags.length === 0) return null;
    return getTopicHubsForTags(lastRead.tags, 1)[0] ?? null;
  }, [lastRead]);

  return (
    <Section padding="compact" size="wide" divider topDivider reveal={false}>
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="New here? Start with these"
          description="A quick path to get the most out of this site."
          align="center"
        />

        <div className="grid sm:grid-cols-3 gap-4">
          <Reveal delayMs={0}>
            <Link href={returning ? `/blog/${lastRead.slug}` : "/about"} className="group block h-full">
              <div className="neu-pressed rounded-xl p-4 h-full hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="neu-flat-sm rounded-lg p-2">
                    <Compass className="h-4 w-4 text-primary" />
                  </div>
                  {returning ? <BookOpen className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                </div>
                <h3 className="font-semibold text-sm mb-1">
                  {returning ? "Continue Reading" : "About Me"}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {returning
                    ? (lastRead.title ? `Pick up: ${lastRead.title}` : "Pick up where you left off.")
                    : "Get to know who I am."}
                </p>
                {returning && lastReadProgress !== null && (
                  <div className="mb-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/70">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${lastReadProgress}%` }}
                        aria-label={`Reading progress ${lastReadProgress}%`}
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                      {lastReadProgress}% read
                    </div>
                  </div>
                )}
                <span className="text-primary text-xs group-hover:underline inline-flex items-center gap-1">
                  {returning ? "Resume" : "Read"} <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal delayMs={80}>
            <Link href={returning && recommendedHub ? `/topics/${recommendedHub.slug}` : "/blog"} className="group block h-full">
              <div className="neu-pressed rounded-xl p-4 h-full hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="neu-flat-sm rounded-lg p-2">
                    <Compass className="h-4 w-4 text-primary" />
                  </div>
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">
                  {returning && recommendedHub ? "More Like This" : "Explore Blog"}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {returning && recommendedHub
                    ? recommendedHub.description
                    : "AI, data science, and dev."}
                </p>
                <span className="text-primary text-xs group-hover:underline inline-flex items-center gap-1">
                  {returning && recommendedHub ? "Explore" : "Browse"} <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal delayMs={160}>
            <Link href="/chat" className="group block h-full">
              <div className="neu-pressed rounded-xl p-4 h-full hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="neu-flat-sm rounded-lg p-2">
                    <Compass className="h-4 w-4 text-primary" />
                  </div>
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">AI Chat</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Ask me anything.
                </p>
                <span className="text-primary text-xs group-hover:underline inline-flex items-center gap-1">
                  Chat <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>

        {popular.length > 0 && (
          <div className="mt-6 neu-card rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <div className="text-sm font-semibold">Popular Posts</div>
              <div className="text-xs text-muted-foreground">(views)</div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {popular.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-border/60 bg-background/70 px-4 py-3 hover:bg-primary/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-muted-foreground tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {post.title}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {post.views.toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
