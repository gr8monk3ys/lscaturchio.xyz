import { Suspense } from "react";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { PhotosGrid } from "@/components/photos/PhotosGrid";
import { Metadata } from "next";
import { Camera, Loader2 } from "lucide-react";
import type { PhotoCategory } from "@/constants/photos";

export const metadata: Metadata = {
  title: "Photography | Lorenzo Scaturchio",
  description: "A collection of travel, landscape, and nature photography. Shot on Fuji X-T30 II with various film simulation recipes.",
};

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
        {/* Header */}
        <div className="mb-12 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Photography</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            Moments captured through my lens. A collection of travel, landscape, and nature
            photography shot on my Fuji X-T30 II with custom film simulation recipes.
          </Paragraph>
        </div>

        <Suspense fallback={<PhotosGridSkeleton />}>
          <PhotosGrid initialCategory={initialCategory} />
        </Suspense>
      </div>
    </Container>
  );
}
