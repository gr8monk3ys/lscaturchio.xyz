"use client";

import { useEffect } from "react";
import { Eye } from "lucide-react";
import { logError } from "@/lib/logger";
import { useViewCount } from "@/hooks/use-view-counts";

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const { viewCount, trackView } = useViewCount(slug);

  useEffect(() => {
    // Check if this post has been viewed in this session
    const viewedKey = `viewed_${slug}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    const recordView = async () => {
      try {
        // Record view if not already viewed in this session
        if (!hasViewed) {
          await trackView();
          sessionStorage.setItem(viewedKey, "true");
        }
      } catch (error) {
        logError("Failed to record/fetch views", error, { component: "ViewCounter", slug });
      }
    };

    recordView();
  }, [slug, trackView]);

  // One fixed footprint for both states.
  //
  // This used to render `---` (about 45px) and then swap in `1,234 views`
  // (about 101px). It sits in the essay header's `flex-wrap` meta row — date ·
  // reading time · tags · stage · views — so on any essay whose row nearly
  // fills one line, that 56px growth wrapped the row to two lines and pushed
  // the h1, the description and the 16:9 hero plate down by 26px.
  //
  // Measured across six essays: four shifted 0.115–0.119 cumulative layout
  // shift against a 0.15 budget, and the two that did not were the ones whose
  // meta row already wrapped, so adding width changed no line count. The
  // Lighthouse gate tests `building-rag-systems`, one of the two clean ones,
  // which is why a 40x worse number than the gate reports went unseen. It
  // reproduced on a first-ever request and on a second, so it is not a
  // streaming artifact.
  //
  // `tabular-nums` keeps the digits from changing width as the count grows;
  // the min-width keeps the whole element from changing the row's line count.
  // Reserved, but blank, until the number is real.
  //
  // The unsettled state used to render the literal string "— views", which a
  // design review flagged as a visible degraded state — and it was worse than
  // it looked. `useViewCount` returns `0` when the request fails and `null`
  // only while it is in flight, so "— views" is a *loading* placeholder, not a
  // failure one. That means it persists for as long as the request does: on a
  // browser with a tracker blocker, `/api/views` never answers, and the essay
  // header shows an em dash followed by the word VIEWS for the entire visit.
  // A reader cannot tell that from a broken counter, because it is one.
  //
  // `invisible` keeps every pixel of the footprint the comment above is about
  // — the element still occupies its 6.5rem, so the meta row's line count and
  // therefore the CLS guarantee are untouched — while showing nothing until
  // there is something true to show. `aria-hidden` while unsettled so a screen
  // reader is not handed a count that does not exist yet.
  const settled = viewCount !== null;

  return (
    <div
      className={`flex min-w-[6.5rem] items-center gap-2 text-sm text-muted-foreground tabular-nums ${
        settled ? "" : "invisible"
      }`}
      aria-hidden={settled ? undefined : true}
    >
      <Eye aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>
        {settled
          ? `${viewCount.toLocaleString()} ${viewCount === 1 ? "view" : "views"}`
          : "— views"}
      </span>
    </div>
  );
}
