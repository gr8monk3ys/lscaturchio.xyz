import { cn } from "@/lib/utils";

/**
 * The shared vocabulary for `loading.tsx`, so a skeleton is built from the same
 * parts as the page it stands in for.
 *
 * All four skeletons used to be the pre-redesign template: centred headers,
 * `neu-card` tiled grids, pill-shaped chips, and a 192px round avatar on
 * /about, where the site actually shows a square hairline-bordered plate. A
 * skeleton that does not match its page is worse than none — it promises a
 * layout, and then the content arrives and moves everything. It is also the
 * only part of the site most readers see at its slowest moment.
 *
 * These are deliberately not the shadcn `Skeleton`: they carry no radius of
 * their own, because the surfaces they stand in for do not have one.
 */

/** One pulsing bar of paper. Height and width come from the caller. */
export function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted", className)} />;
}

/**
 * The masthead placard: wall label, page title, blurb, hairline. Mirrors
 * `PageHead`, including the real `gallery-rule`, which needs no placeholder
 * because it renders instantly.
 */
export function SkeletonPageHead({
  blurbLines = 2,
  rule = true,
  className,
}: {
  blurbLines?: number;
  rule?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <SkeletonBar className="h-3 w-44" />
      <SkeletonBar className="mt-4 h-9 w-full max-w-xl sm:h-11" />
      <div className="mt-5 space-y-2.5">
        {Array.from({ length: blurbLines }, (_, index) => (
          <SkeletonBar
            key={index}
            className={cn("h-4", index === blurbLines - 1 ? "w-2/3" : "w-full", "max-w-2xl")}
          />
        ))}
      </div>
      {rule && <hr className="gallery-rule mt-8" />}
    </div>
  );
}

/**
 * A stacked hairline-divided row: wall label above, title, clamped
 * description below. The list shape DESIGN.md prefers over tiled cards.
 */
export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="py-6">
          <SkeletonBar className="h-3 w-32" />
          <SkeletonBar className="mt-3 h-5 w-3/4 max-w-md" />
          <SkeletonBar className="mt-2.5 h-4 w-full max-w-xl" />
        </li>
      ))}
    </ul>
  );
}

/**
 * A card with an image plate above its text, for the two indexes that really
 * are grids. Square, because every image plate on this site is.
 */
export function SkeletonCard({ plate = "h-48" }: { plate?: string }) {
  return (
    <div className="border border-border">
      <SkeletonBar className={cn("w-full", plate)} />
      <div className="p-5">
        <SkeletonBar className="h-3 w-28" />
        <SkeletonBar className="mt-3 h-5 w-4/5" />
        <SkeletonBar className="mt-2.5 h-4 w-full" />
        <SkeletonBar className="mt-2 h-4 w-2/3" />
      </div>
    </div>
  );
}
