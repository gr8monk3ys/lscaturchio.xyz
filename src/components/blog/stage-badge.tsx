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
  // 80% opacity keeps the tint but stays above the 4.5:1 WCAG AA contrast
  // floor for small text (70% composited to ~4.1:1 on the cream background).
  return <span className="text-primary/80">{STAGE_LABELS[stage].label}</span>;
}
