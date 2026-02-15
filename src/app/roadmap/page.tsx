import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { Badge } from "@/components/ui/badge";
import { ROADMAP, type RoadmapStatus } from "@/constants/roadmap";
import { Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Roadmap | Lorenzo Scaturchio",
  description: "What I'm working on now, what's next, and what's later.",
};

const STATUS_LABELS: Record<RoadmapStatus, string> = {
  now: "Now",
  next: "Next",
  later: "Later",
};

export default function RoadmapPage() {
  const groups = {
    now: ROADMAP.filter((i) => i.status === "now"),
    next: ROADMAP.filter((i) => i.status === "next"),
    later: ROADMAP.filter((i) => i.status === "later"),
  } as const;

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <Compass className="h-7 w-7 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Roadmap</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            A lightweight view of what I&apos;m shipping on this site.
            For release notes, follow the changelog.
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(Object.keys(groups) as Array<RoadmapStatus>).map((status) => (
            <section key={status} className="space-y-4">
              <h2 className="text-xl font-semibold">{STATUS_LABELS[status]}</h2>
              <div className="space-y-4">
                {groups[status].map((item) => (
                  <div key={item.id} className="neu-card p-6">
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {groups[status].length === 0 && (
                  <div className="neu-flat rounded-2xl p-6 text-sm text-muted-foreground">
                    Nothing here yet.
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}

