import { Container } from "@/components/Container";
import {
  SkeletonBar,
  SkeletonCard,
  SkeletonPageHead,
} from "@/components/ui/skeleton-primitives";

/** Placard, one CTA, the filter rail, then the two-column case-study grid. */
export default function ProjectsLoading() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="mx-auto max-w-6xl">
        <SkeletonPageHead blurbLines={2} rule={false} className="mb-10" />
        <SkeletonBar className="h-3 w-52" />

        <div className="mt-10 flex flex-wrap gap-3">
          {[0, 1, 2, 3, 4].map((chip) => (
            <SkeletonBar key={chip} className="h-7 w-24" />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          {[0, 1, 2, 3].map((slot) => (
            <SkeletonCard key={slot} plate="h-56" />
          ))}
        </div>
      </div>
    </Container>
  );
}
