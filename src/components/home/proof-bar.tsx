import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { badgeVariants } from "@/components/ui/badge";
import { Sparkles, BarChart3, Users, Star } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const proofItems = [
  {
    icon: BarChart3,
    label: "Education",
    value: "+30% engagement and +25% learning efficiency",
    proofHref: "/projects/talker",
  },
  {
    icon: Star,
    label: "Retrieval",
    value: "Grounded answers with citations and multimodal context",
    proofHref: "/blog/building-rag-systems",
  },
  {
    icon: Users,
    label: "Automation",
    value: "Trading, publishing, and workflow systems with guardrails",
    proofHref: "/projects/ai-powered-trading-bot",
  },
  {
    icon: Sparkles,
    label: "Public Proof",
    value: "Case studies, repos, and writing you can inspect directly",
    proofHref: "https://github.com/gr8monk3ys",
  },
];

export function ProofBar() {
  return (
    <Section padding="compact" size="wide" reveal={false}>
      <div className="neu-card rounded-2xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {proofItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.label}
                delayMs={index * 70}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/85 px-4 py-3"
              >
                <div className="neu-flat-sm rounded-lg p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className="font-semibold text-foreground">{item.value}</div>
                </div>
                <Link
                  href={item.proofHref}
                  prefetch={item.proofHref.startsWith("/") ? false : undefined}
                  target={item.proofHref.startsWith("http") ? "_blank" : undefined}
                  rel={item.proofHref.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={cn(
                    badgeVariants({ variant: "secondary" }),
                    "ml-1 hidden lg:inline-flex"
                  )}
                >
                  Proof
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
