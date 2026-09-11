import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PhotosGrid } from "@/components/photos/PhotosGrid";
import { Loader2 } from "lucide-react";
import type { PhotoCategory } from "@/constants/photos";
import { PageHead } from "@/components/ui/page-head";
import {
  readEnumParam,
  type SearchParamValue,
} from "@/lib/search-params";

export const metadata = buildPageMetadata({
  title: "Photography",
  description: "Photographs from wherever I have been carrying the camera. Shot on a Fuji X-T30 II, mostly on film simulation recipes.",
  path: "/photos",
});

function PhotosGridSkeleton() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

const PHOTO_CATEGORIES: readonly PhotoCategory[] = ["all", "travel", "nature"];

export default async function PhotosPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const initialCategory = readEnumParam(params, "category", PHOTO_CATEGORIES, "all");

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header — gallery masthead */}
        <PageHead
          className="mb-12"
          kicker="Garden · Photography"
          title="Photography"
          blurb={
            <>
              Travel, landscape, and nature work, shot on a Fuji X-T30 II with custom film
              simulation recipes.
            </>
          }
        />

        <Suspense fallback={<PhotosGridSkeleton />}>
          <PhotosGrid initialCategory={initialCategory} />
        </Suspense>

        {/* A measurement found this page rendering zero interactive controls
            inside `main` — the 404 offers three ways out and this real page
            offered none. The grid's own links exist only once photos load, so
            a reader who arrives before that, or with images failing, is
            stranded. `not-found.tsx` closes this way and so does /music. */}
        <hr className="gallery-rule mt-16" />

        <nav
          className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3"
          aria-label="Elsewhere in the garden"
        >
          <Link
            href="/garden"
            className="label-mono label-link text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            ← Back to the garden
          </Link>
          <Link
            href="/uses"
            className="label-mono label-link text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            The camera and the recipes
          </Link>
          <Link
            href="/about"
            className="label-mono label-link text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Who is holding it
          </Link>
        </nav>
      </div>
    </Container>
  );
}
