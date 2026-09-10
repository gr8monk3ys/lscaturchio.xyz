import { Container } from "@/components/Container";
import { SkeletonBar } from "@/components/ui/skeleton-primitives";

/**
 * The essay shell, held open while the page streams.
 *
 * This used to be the blog *index* skeleton — one `loading.tsx` at
 * `app/blog/` covers the segment and every route nested under it, so all 83
 * essays opened on a six-card grid and then replaced it with a single prose
 * column. Lighthouse measured 0.26 cumulative layout shift on
 * /blog/building-rag-systems against a 0.15 budget, and every point of it was
 * this swap. The index now owns its own skeleton under `(index)/`, a route
 * group that scopes the fallback without changing the URL.
 *
 * The geometry here is `BlogLayout`'s, deliberately: the 260px contents rail,
 * the 42rem prose column, the wall-label meta line, and the 16:9 plate. What
 * arrives should land on top of this, not push it aside.
 */
export default function EssayLoading() {
  return (
    <Container className="mt-8 lg:mt-16">
      <div className="xl:grid xl:grid-cols-[260px_1fr] xl:gap-12 xl:items-start">
        {/* Contents rail. Hidden below xl, exactly as the real one is. */}
        <div className="hidden xl:block">
          <SkeletonBar className="h-3 w-24" />
          <div className="mt-4 space-y-2.5">
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <SkeletonBar
                key={row}
                className={row % 3 === 2 ? "h-3.5 w-2/3" : "h-3.5 w-full"}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-2xl xl:mx-0">
          {/* Breadcrumb, then the mono meta line: date · reading time · tags. */}
          <SkeletonBar className="h-3 w-32" />

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <SkeletonBar className="h-3 w-28" />
            <SkeletonBar className="h-3 w-12" />
            <SkeletonBar className="h-3 w-20" />
            <SkeletonBar className="h-3 w-16" />
          </div>

          <div className="mt-5 space-y-3">
            <SkeletonBar className="h-9 w-full sm:h-11" />
            <SkeletonBar className="h-9 w-4/5 sm:h-11" />
          </div>

          <div className="mt-5 space-y-2.5">
            <SkeletonBar className="h-5 w-full" />
            <SkeletonBar className="h-5 w-3/4" />
          </div>

          {/* Byline, set as a wall label like the real one. */}
          <SkeletonBar className="mt-5 h-3 w-64" />

          <hr className="gallery-rule mt-8" />

          <SkeletonBar className="mt-8 aspect-video w-full" />

          <div className="mt-8 space-y-3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((line) => (
              <SkeletonBar
                key={line}
                className={line % 4 === 3 ? "h-4 w-3/5" : "h-4 w-full"}
              />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
