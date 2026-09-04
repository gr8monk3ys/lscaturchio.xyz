import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";
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
  description: "A collection of travel, landscape, and nature photography. Shot on Fuji X-T30 II with various film simulation recipes.",
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
      </div>
    </Container>
  );
}
