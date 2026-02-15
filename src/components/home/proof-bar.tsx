"use client";

import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { badgeVariants } from "@/components/ui/badge";
import { Sparkles, BarChart3, Users, Star } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const proofItems = [
  {
    icon: BarChart3,
    label: "Impact",
    value: "Talker lifted engagement +30% and learning +25%",
    proofHref: "/projects/talker",
  },
  {
    icon: Star,
    label: "RAG Systems",
    value: "Citations‑first answers with multimodal context",
    proofHref: "/blog/building-rag-systems",
  },
  {
    icon: Users,
    label: "Automation",
    value: "Trading bot with sentiment + strict risk controls",
    proofHref: "/projects/ai-powered-trading-bot",
  },
  {
    icon: Sparkles,
    label: "Open Source",
    value: "Public work across RAG and developer tools",
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
