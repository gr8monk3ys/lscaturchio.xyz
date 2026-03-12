"use client";

import { ArrowUpRight, CalendarDays, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export function ContactCTA() {
  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-20">
      <div className="mx-auto w-full max-w-6xl neu-card p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-10">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Need help shipping AI?
            </div>

            <div className="space-y-4">
              <h2 className="text-display max-w-3xl text-balance">
                Send the brief if you need a system that works past the demo.
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground text-balance">
                Best fit for grounded RAG, ML workflows, architecture reviews, and automation that
                has to survive real usage. If you can describe the goal, the user, the data, or the
                main constraint, that is enough to start.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                prefetch={false}
                className="cta-primary inline-flex h-11 items-center gap-2 rounded-xl px-6 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mail className="h-4 w-4" />
                Send Project Brief
              </Link>
              <Link
                href="/work-with-me"
                prefetch={false}
                className="cta-secondary inline-flex h-11 items-center gap-2 rounded-xl px-6 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                See How I Work
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="text-sm text-muted-foreground">
              Prefer a call?{" "}
              <Link
                href="https://calendly.com/gr8monk3ys/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
              >
                Book 30 minutes
              </Link>
              .
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-border/60 bg-background/75 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Best for
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>RAG and search systems that need grounded answers and measurable quality.</li>
                <li>Architecture reviews for latency, cost, reliability, and rollout risk.</li>
                <li>Automation and internal tools that need clear ownership after handoff.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/75 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Include in your brief
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>The outcome you want.</li>
                <li>The user or team this is for.</li>
                <li>The data, systems, or constraints that make the problem real.</li>
                <li>The timeline if there is a real decision deadline.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
