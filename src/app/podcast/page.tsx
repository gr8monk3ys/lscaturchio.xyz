import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { PodcastSection } from "@/components/podcast/PodcastSection";
import { Metadata } from "next";
import { Mic } from "lucide-react";

export const metadata: Metadata = {
  title: "Podcast | Lorenzo Scaturchio",
  description: "Conversations about AI, technology, and building the future. Coming soon.",
};

export default function PodcastPage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Podcast</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            Conversations about AI, technology, philosophy, and building things that matter.
            Deep dives with interesting people doing interesting work.
          </Paragraph>
        </div>

        <PodcastSection />
      </div>
    </Container>
  );
}
