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
  return <span className="text-primary/70">{STAGE_LABELS[stage].label}</span>;
}
