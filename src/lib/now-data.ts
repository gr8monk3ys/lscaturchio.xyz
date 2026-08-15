import nowJson from "@/data/now.json";

// Single source of truth for when this snapshot was last reviewed. Stored in
// src/data/now.json (editable via the /admin portal) — the human-readable
// label and the staleness banner on /now are both derived from it, so they
// can never drift.
export const NOW_LAST_UPDATED: string = nowJson.lastUpdated;

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

export interface NowContent {
  lastUpdated: string;
  location: { label: string; detail: string };
  building: NowBuild[];
  thinkingAbout: string[];
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
  location: nowJson.location,
  building: nowJson.building as NowBuild[],
  thinkingAbout: nowJson.thinkingAbout as string[],
};

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
