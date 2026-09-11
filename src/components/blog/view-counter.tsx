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
  const settled = viewCount !== null;

  return (
    <div className="flex min-w-[6.5rem] items-center gap-2 text-sm text-muted-foreground tabular-nums">
      <Eye aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>
        {settled
          ? `${viewCount.toLocaleString()} ${viewCount === 1 ? "view" : "views"}`
          : "— views"}
      </span>
    </div>
  );
}
