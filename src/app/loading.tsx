import { Container } from "@/components/Container";
import { SkeletonBar, SkeletonCard } from "@/components/ui/skeleton-primitives";

/**
 * The masthead is an asymmetric `1fr / 300px` split with a square portrait
 * plate at the right edge, not a centred stack. This skeleton holds that
 * shape so nothing jumps sideways when the page arrives.
 */
export default function HomeLoading() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 py-16 md:grid-cols-[1fr_minmax(0,300px)] md:items-end md:py-24 lg:py-28">
        <div className="min-w-0 space-y-6">
          <SkeletonBar className="h-3 w-56" />
          <div className="space-y-3">
            <SkeletonBar className="h-11 w-full max-w-lg sm:h-14" />
            <SkeletonBar className="h-11 w-3/4 max-w-md sm:h-14" />
          </div>
          <div className="max-w-xl space-y-2.5">
            <SkeletonBar className="h-5 w-full" />
            <SkeletonBar className="h-5 w-4/5" />
          </div>
        </div>

        {/* Square plate with its mono caption below, like a placard. */}
        <div className="mx-auto w-44 sm:w-52 md:mx-0 md:w-full md:max-w-[300px]">
          <SkeletonBar className="aspect-square w-full" />
          <SkeletonBar className="mt-3 h-3 w-3/4" />
        </div>
      </div>

      <Container className="mt-4">
        <hr className="gallery-rule" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((slot) => (
            <SkeletonCard key={slot} plate="h-40" />
          ))}
        </div>
      </Container>
    </section>
  );
}
