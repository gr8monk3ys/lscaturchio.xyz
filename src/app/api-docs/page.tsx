import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { Code2 } from "lucide-react";

export const metadata: Metadata = {
  title: "API Docs | Lorenzo Scaturchio",
  description: "Public JSON endpoints for posts, projects, and now page data.",
};

const ENDPOINTS = [
  {
    name: "Posts",
    path: "/api/posts",
    description: "Blog post metadata (optionally includes audio availability).",
    example: "/api/posts?limit=50",
  },
  {
    name: "Projects",
    path: "/api/projects",
    description: "Project metadata (titles, stacks, case-study summaries).",
    example: "/api/projects",
  },
  {
    name: "Now",
    path: "/api/now",
    description: "Structured data behind the /now page.",
    example: "/api/now",
  },
];

export default function ApiDocsPage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <Code2 className="h-7 w-7 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Public API</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            These endpoints are read-only and intended for integrations, personal tooling, and community remixing.
          </Paragraph>
        </div>

        <div className="space-y-4">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="neu-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{e.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
                  <div className="mt-3 text-sm font-mono">
                    <Link href={e.path} className="text-primary hover:underline">
                      {e.path}
                    </Link>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground font-mono">
                    Example:{" "}
                    <Link href={e.example} className="hover:underline">
                      {e.example}
                    </Link>
                  </div>
                </div>
                <Link
                  href={e.path}
                  className="neu-button rounded-xl px-4 py-2 text-sm hover:text-primary transition-colors"
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 neu-flat rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">
            Want a new endpoint or a stable schema for a specific use case?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Reach out
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}

