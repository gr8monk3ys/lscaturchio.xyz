import { Container } from "@/components/Container";
import { SkeletonBar, SkeletonRows } from "@/components/ui/skeleton-primitives";

/**
 * /about opens on a two-column split with a square hairline-bordered
 * photograph, not a 192px circle. The circle was the last avatar on the site.
 */
export default function AboutLoading() {
  return (
    <Container size="wide">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <SkeletonBar className="h-9 w-full max-w-lg sm:h-11" />
          <SkeletonBar className="h-9 w-3/4 max-w-sm sm:h-11" />
          <div className="space-y-2.5 pt-2">
            {[0, 1, 2, 3].map((line) => (
              <SkeletonBar key={line} className={line === 3 ? "h-5 w-2/3" : "h-5 w-full"} />
            ))}
          </div>
        </div>
        <SkeletonBar className="aspect-square w-full" />
      </div>

      <div className="mt-16 space-y-6">
        <SkeletonBar className="h-8 w-64" />
        <SkeletonRows count={3} />
      </div>
    </Container>
  );
}
