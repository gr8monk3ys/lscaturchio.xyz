import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { FlaskConical } from "lucide-react";
import { SemanticSearchDemo } from "@/components/lab/semantic-search-demo";
import { ToySimilarity } from "@/components/lab/toy-similarity";
import { AskLorenzoDemo } from "@/components/lab/ask-lorenzo-demo";

export const metadata: Metadata = {
  title: "Lab | Lorenzo Scaturchio",
  description: "Interactive demos: semantic search, RAG, and how the pieces fit together.",
};

export default function LabPage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <FlaskConical className="h-7 w-7 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Lab</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            Small interactive demos that explain how search and RAG work on this site.
            Expect rough edges and experiments.
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <SemanticSearchDemo />
          <AskLorenzoDemo />
          <ToySimilarity />
        </div>
      </div>
    </Container>
  );
}

