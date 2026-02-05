"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code, Brain, Server } from "lucide-react";
import { HoverCard } from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Section, SectionHeader } from "@/components/ui/Section";
import { staggerContainer, staggerItem } from "@/lib/animations";

const workItems = [
  {
    icon: Brain,
    title: "Talker: RAG Teaching Assistant",
    description:
      "Built a retrieval assistant for course materials with grounded, source-aware responses.",
    result: "Result: Faster, clearer answers for learners.",
    linkText: "View the project",
    linkHref: "/projects/talker",
    featured: true,
    logo: {
      type: "image" as const,
      src: "/images/logos/talker.webp",
      alt: "Talker project logo",
    },
  },
  {
    icon: Code,
    title: "AI-Powered Trading Bot",
    description:
      "Automated trading with sentiment analysis, technical indicators, and strict risk controls.",
    result: "Result: 24/7 monitoring with disciplined trade execution.",
    linkText: "View the project",
    linkHref: "/projects/ai-powered-trading-bot",
    featured: false,
    logo: {
      type: "image" as const,
      src: "/images/logos/trading-bot.webp",
      alt: "AI-Powered Trading Bot logo",
    },
  },
  {
    icon: Server,
    title: "Blog-AI: Content System",
    description:
      "Automated SEO-aware content generation with GPT-4 workflows and structured output.",
    result: "Result: Consistent drafts with clean MDX + DOCX exports.",
    linkText: "View the project",
    linkHref: "/projects/blog-ai",
    featured: false,
    logo: {
      type: "image" as const,
      src: "/images/logos/blog-ai.webp",
      alt: "Blog-AI logo",
    },
  },
];

export function WorkingOnSection() {
  return (
    <Section padding="large" size="wide" divider topDivider>
      <SectionHeader
        title="Selected Case Studies"
        description="A few highlights that show how I work"
        align="center"
      />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
      >
        {workItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.title} variants={staggerItem}>
              <HoverCard
                className={`neu-card p-6 h-full relative overflow-hidden group ${
                  item.featured
                    ? "border border-primary/20 bg-gradient-to-b from-primary/5 to-background"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="neu-flat-sm rounded-xl p-3 w-fit">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div
                  className={`absolute right-4 top-4 transition-all duration-200 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 ${
                    item.featured ? "opacity-100 scale-100" : ""
                  }`}
                  aria-hidden
                >
                  <div
                    className={`rounded-xl p-2 ${
                      item.featured
                        ? "neu-pressed ring-1 ring-primary/30 bg-primary/10"
                        : "neu-pressed"
                    }`}
                  >
                    {item.logo.type === "image" ? (
                      <OptimizedImage
                        src={item.logo.src}
                        alt={item.logo.alt}
                        width={40}
                        height={40}
                        className="rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <Icon className="h-5 w-5 text-primary/80" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  {item.featured && (
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-3">{item.description}</p>
                <p className="text-sm text-foreground/80 mb-4">{item.result}</p>
                <Link
                  href={item.linkHref}
                  className="text-primary hover:underline flex items-center group"
                >
                  {item.linkText}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </HoverCard>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
