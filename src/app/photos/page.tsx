import { Suspense } from "react";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { PhotosGrid } from "@/components/photos/PhotosGrid";
import { Metadata } from "next";
import { Camera, Loader2 } from "lucide-react";

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

export default function PhotosPage() {
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
          <PhotosGrid />
        </Suspense>
      </div>
    </Container>
  );
}
