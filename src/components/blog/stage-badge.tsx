import type { BlogStage } from "@/lib/blog-stage";
import { STAGE_LABELS } from "@/lib/blog-stage";

/**
 * The maturity badge that hangs in a post's mono wall-label, e.g. EVERGREEN.
 * Tinted to set it apart from the date/tags; renders nothing when a post has
 * no stage. No leading separator — call sites add their own "·" to match the
 * surrounding label.
 */
export function StageBadge({ stage }: { stage?: BlogStage }) {
  if (!stage) return null;
  // Full opacity: at 80% this composited to 4.47:1 in dark mode (#388b65 on
  // #111317), just under the 4.5:1 AA floor. The previous note only checked
  // the cream background.
  const { label, blurb } = STAGE_LABELS[stage];
  // The blurb was written for all three stages and rendered for none of them,
  // so "SEEDLING" sat beside a date with nothing to say what it meant. It is a
  // one-word vocabulary the reader has to already know; `title` answers on
  // hover, and the sr-only sentence answers for a screen reader, which cannot
  // hover at all.
  return (
    <span className="text-primary" title={blurb}>
      {label}
      <span className="sr-only"> — {blurb}</span>
    </span>
  );
}
