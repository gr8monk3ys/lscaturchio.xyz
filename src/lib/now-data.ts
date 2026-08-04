// Single source of truth for when this snapshot was last reviewed. Update this
// ISO date whenever you revise the content below — the human-readable label and
// the staleness banner on /now are both derived from it, so they can never drift.
export const NOW_LAST_UPDATED = "2026-07-31";

// A /now page is a promise of currency. If it goes longer than this without a
// review, the page surfaces a visible "may be out of date" notice instead of
// silently implying everything below is still true.
export const NOW_STALE_AFTER_DAYS = 120;

export interface NowBuild {
  title: string;
  /** Where to read more — a case study on this site, or the repo. */
  href: string;
  note: string;
}

/**
 * Only the parts of /now that genuinely require a human live here. Reading,
 * watching, and recent writing are read from the Goodreads/Letterboxd exports
 * and the blog at render time, so the majority of the page cannot go stale
 * between reviews — which is the failure mode every /now page has.
 */
export const nowData = {
  /** Human-readable label, derived from NOW_LAST_UPDATED so it stays in sync. */
  lastUpdatedLabel: new Date(NOW_LAST_UPDATED).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
  location: {
    label: "Southern California",
    detail: "Working remotely as a freelance AI consultant and developer.",
  },
  building: [
    {
      title: "Verso",
      href: "/projects/verso",
      note: "A diary for artworks, built on the bet that logging individual works instead of gallery visits is what makes the habit stick.",
    },
    {
      title: "Cocoon and Feedless",
      href: "/projects/cocoon",
      note: "Two browser extensions aimed at the same problem from different angles: giving people back control of what a page does to their attention.",
    },
    {
      title: "unlinkd",
      href: "/projects/unlinkd",
      note: "Encrypted, local-only evidence keeping for data-broker removal, because the hard part of disappearing is proving you asked.",
    },
    {
      title: "The repo fleet",
      href: "https://github.com/gr8monk3ys",
      note: "Roughly seventy repositories run by scheduled agents that open pull requests rather than pushing. I review a queue instead of seventy inboxes.",
    },
  ] satisfies NowBuild[],
  thinkingAbout: [
    "Whether self-hosting is a technical preference or a political one, and what changes if it is the second.",
    "How much of what gets called productivity is really just legibility to someone else.",
    "Tools that degrade gracefully when the company behind them disappears.",
    "Why the interesting part of a recommendation system is what it refuses to show you.",
  ],
} as const;

/**
 * How stale is the /now snapshot? Computed at render time so the page can warn
 * visitors (and remind the owner) when it has drifted past NOW_STALE_AFTER_DAYS.
 */
export function getNowFreshness(now: Date = new Date()): {
  isStale: boolean;
  daysSinceUpdate: number;
} {
  const updated = new Date(NOW_LAST_UPDATED).getTime();
  const daysSinceUpdate = Math.max(
    0,
    Math.floor((now.getTime() - updated) / (1000 * 60 * 60 * 24)),
  );
  return { isStale: daysSinceUpdate > NOW_STALE_AFTER_DAYS, daysSinceUpdate };
}
