import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { PhotosGrid } from "@/components/photos/PhotosGrid";
import { Loader2 } from "lucide-react";
import type { PhotoCategory } from "@/constants/photos";

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

type SearchParamValue = string | string[] | undefined;

function getSearchParamValue(
  params: Record<string, SearchParamValue>,
  key: string
): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function normalizeCategory(value: string): PhotoCategory {
  const allowed: PhotoCategory[] = ["all", "travel", "nature"];
  return allowed.includes(value as PhotoCategory) ? (value as PhotoCategory) : "all";
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const initialCategory = normalizeCategory(getSearchParamValue(params, "category"));

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header — gallery masthead */}
        <header className="mb-12">
          <span className="label-mono block">Garden · Photography</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">Photography</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Moments captured through my lens. A collection of travel, landscape, and nature
            photography shot on my Fuji X-T30 II with custom film simulation recipes.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

        <Suspense fallback={<PhotosGridSkeleton />}>
          <PhotosGrid initialCategory={initialCategory} />
        </Suspense>
      </div>
    </Container>
  );
}
