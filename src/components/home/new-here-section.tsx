"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { LedgerRows } from "@/components/ui/ledger-section";
import { getTopicHubsForTags } from "@/constants/topics";

interface PopularPostData {
  slug: string;
  title: string;
  views: number;
}

interface NewHereSectionProps {
  popularPosts: PopularPostData[];
}

interface Step {
  href: string;
  label: string;
  title: string;
  blurb: string;
  cta: string;
  progress?: number | null;
}

export function NewHereSection({ popularPosts }: NewHereSectionProps) {
  const [lastRead, setLastRead] = useState<{
    slug: string;
    title?: string;
    tags?: string[];
  } | null>(null);
  const [lastReadProgress, setLastReadProgress] = useState<number | null>(null);

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
  }, []);

  const recommendedHub = useMemo(() => {
    if (!lastRead?.tags || lastRead.tags.length === 0) return null;
    return getTopicHubsForTags(lastRead.tags, 1)[0] ?? null;
  }, [lastRead]);

  // Only claim someone stopped partway through when the stored progress says
  // so. An entry in the history means the page was opened, which is not the
  // same thing, and this site does not assert what it cannot show.
  const resumable =
    lastRead &&
    typeof lastReadProgress === "number" &&
    lastReadProgress >= 5 &&
    lastReadProgress < 95
      ? { slug: lastRead.slug, title: lastRead.title, progress: lastReadProgress }
      : null;

  // Three doorways in reading order: the work, then the person, then what is
  // current. Rows on the paper, not a tray of cards.
  const steps: Step[] = [
    resumable
      ? {
          href: `/blog/${resumable.slug}`,
          label: "Where you stopped",
          title: resumable.title ?? "Pick up where you left off",
          blurb: "You stopped partway through this one.",
          cta: "Resume",
          progress: resumable.progress,
        }
      : {
          href: "/blog",
          label: "Start with the writing",
          title: "Mostly arguments",
          blurb:
            "Eighty-three essays on power, attention, and what institutions are actually built to do.",
          cta: "Read the essays",
        },
    recommendedHub
      ? {
          href: `/topics/${recommendedHub.slug}`,
          label: "Then the thread",
          title: recommendedHub.title,
          blurb: recommendedHub.description,
          cta: "Follow it",
        }
      : {
          href: "/about",
          label: "Then the person",
          title: "Who is writing this",
          blurb:
            "A writer and engineer in Los Angeles who builds AI systems and is suspicious of them.",
          cta: "About me",
        },
    {
      href: "/now",
      label: "Then what is current",
      title: "What I'm doing now",
      blurb: "Reading, watching, and building, each line honestly dated.",
      cta: "See now",
    },
  ];

  return (
    <Section padding="compact" size="wide" divider topDivider reveal={false}>
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          index="04"
          eyebrow="Start here"
          title="New here? Start with these"
          description="A quick path to get the most out of this site."
        />

        <LedgerRows items={steps} numbered className="border-t border-border">
          {(step, entryNumber) => (
            <li key={step.href} className="border-b border-border">
              <Link
                href={step.href}
                prefetch={false}
                className="group grid items-baseline gap-x-6 gap-y-1 py-6 sm:grid-cols-[2.5rem_10rem_1fr]"
              >
                <span className="label-mono tabular-nums" aria-hidden>
                  {entryNumber}
                </span>
                <span className="label-mono">{step.label}</span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {step.title}
                  </span>
                  <span className="mt-1 block max-w-lg text-sm leading-relaxed text-muted-foreground">
                    {step.blurb}
                  </span>

                  {typeof step.progress === "number" && (
                    <span className="mt-3 block max-w-xs">
                      <span
                        className="block h-0.5 w-full bg-border"
                        role="img"
                        aria-label={`Reading progress ${step.progress} percent`}
                      >
                        <span
                          className="block h-0.5 bg-primary"
                          style={{ width: `${step.progress}%` }}
                        />
                      </span>
                      <span className="label-mono mt-1.5 block tabular-nums">
                        {step.progress}% read
                      </span>
                    </span>
                  )}

                  <span className="label-mono mt-3 inline-block text-foreground underline-offset-4 transition-colors group-hover:text-primary group-hover:underline">
                    {step.cta} →
                  </span>
                </span>
              </Link>
            </li>
          )}
        </LedgerRows>

        {popularPosts.length > 0 && (
          <div className="mt-10">
            <span className="label-mono block">Most read</span>
            <LedgerRows items={popularPosts} numbered className="mt-3 border-t border-border">
              {(post, entryNumber) => (
                <li key={post.slug} className="border-b border-border">
                  <Link
                    href={`/blog/${post.slug}`}
                    prefetch={false}
                    className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-6 py-3"
                  >
                    <span className="label-mono tabular-nums" aria-hidden>
                      {entryNumber}
                    </span>
                    <span className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </span>
                  </Link>
                </li>
              )}
            </LedgerRows>
          </div>
        )}
      </div>
    </Section>
  );
}
