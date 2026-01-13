import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { PhotosGrid } from "@/components/photos/PhotosGrid";
import { Metadata } from "next";
import { Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Photos | Lorenzo Scaturchio",
  description: "A collection of my favorite photographs. Moments captured through my lens.",
};

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
            <Heading className="text-4xl font-bold">Photos</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            Moments captured through my lens. A mix of travel, nature, urban exploration,
            and everyday life. Shot primarily on my Sony A7III.
          </Paragraph>
        </div>

        <PhotosGrid />
      </div>
    </Container>
  );
}
