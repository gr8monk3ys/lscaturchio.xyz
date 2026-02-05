"use client";

import Link from "next/link";
import { ArrowRight, Compass, User, BookOpen, MessageSquare } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";

export function NewHereSection() {
  return (
    <Section padding="compact" size="wide" divider topDivider>
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="New here? Start with these"
          description="A quick path to get the most out of this site."
          align="center"
        />

        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/about" className="group">
            <div className="neu-pressed rounded-xl p-4 h-full hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="neu-flat-sm rounded-lg p-2">
                  <Compass className="h-4 w-4 text-primary" />
                </div>
                <User className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">About Me</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Get to know who I am.
              </p>
              <span className="text-primary text-xs group-hover:underline inline-flex items-center gap-1">
                Read <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>

          <Link href="/blog" className="group">
            <div className="neu-pressed rounded-xl p-4 h-full hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="neu-flat-sm rounded-lg p-2">
                  <Compass className="h-4 w-4 text-primary" />
                </div>
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Explore Blog</h3>
              <p className="text-xs text-muted-foreground mb-2">
                AI, data science, and dev.
              </p>
              <span className="text-primary text-xs group-hover:underline inline-flex items-center gap-1">
                Browse <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>

          <Link href="/chat" className="group">
            <div className="neu-pressed rounded-xl p-4 h-full hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="neu-flat-sm rounded-lg p-2">
                  <Compass className="h-4 w-4 text-primary" />
                </div>
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">AI Chat</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Ask me anything.
              </p>
              <span className="text-primary text-xs group-hover:underline inline-flex items-center gap-1">
                Chat <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </Section>
  );
}
