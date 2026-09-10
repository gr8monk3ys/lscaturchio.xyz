import { Container } from "@/components/Container";
import {
  SkeletonBar,
  SkeletonCard,
  SkeletonPageHead,
} from "@/components/ui/skeleton-primitives";

/** The essay index: left-aligned placard, one utility link, then the grid. */
export default function BlogLoading() {
  return (
    <Container size="wide">
      <div className="space-y-10">
        <header className="pt-4">
          <SkeletonPageHead blurbLines={3} rule={false} />
          <SkeletonBar className="mt-6 h-3 w-40" />
          <hr className="gallery-rule mt-8" />
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((slot) => (
            <SkeletonCard key={slot} />
          ))}
        </div>
      </div>
    </Container>
  );
}
