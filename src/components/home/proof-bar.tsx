"use client";

import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BarChart3, Users, Star } from "lucide-react";

const proofItems = [
  {
    icon: BarChart3,
    label: "Impact",
    value: "Talker lifted engagement +30% and learning +25%",
  },
  {
    icon: Star,
    label: "RAG Systems",
    value: "Citations‑first answers with multimodal context",
  },
  {
    icon: Users,
    label: "Automation",
    value: "Trading bot with sentiment + strict risk controls",
  },
  {
    icon: Sparkles,
    label: "Open Source",
    value: "Public work across RAG and developer tools",
  },
];

export function ProofBar() {
  return (
    <Section padding="compact" size="wide">
      <div className="neu-card rounded-2xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {proofItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/85 px-4 py-3"
              >
                <div className="neu-flat-sm rounded-lg p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className="font-semibold text-foreground">{item.value}</div>
                </div>
                <Badge variant="secondary" className="ml-1 hidden lg:inline-flex">
                  Proof
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
