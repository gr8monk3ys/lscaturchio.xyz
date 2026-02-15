import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { PricingSection } from "@/components/services/pricing-section";
import { pricingTiers } from "@/constants/pricing";
import { ArrowUpRight, CalendarDays, Mail, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Work With Me | Lorenzo Scaturchio",
  description: "AI engineering, RAG systems, and practical automation. Clear scope, fast iteration, production-ready delivery.",
};

const frequencies = ["monthly", "yearly"];
const tiers = pricingTiers.map((tier) => ({
  name: tier.name,
  price: tier.price,
  description: tier.description,
  features: tier.features,
  cta: tier.cta,
  highlighted: tier.highlighted,
  popular: tier.popular,
}));

export default function WorkWithMePage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Work With Me</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground max-w-3xl">
            I help teams ship RAG + ML systems that stay reliable in production. Fast prototypes, tight feedback loops,
            and pragmatic delivery.
          </Paragraph>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="https://calendly.com/gr8monk3ys/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary rounded-xl px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Schedule a Call
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="neu-button rounded-xl px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4 text-primary" />
              Contact
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="neu-card p-6">
            <h2 className="text-lg font-semibold">What I Do</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>RAG and search systems with citations and evals</li>
              <li>Agent workflows and automation that actually ship</li>
              <li>Cost and latency optimization for LLM apps</li>
              <li>Architecture review + production hardening</li>
            </ul>
          </div>
          <div className="neu-card p-6">
            <h2 className="text-lg font-semibold">How I Work</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Week 1: scope, data access, quick prototype</li>
              <li>Week 2: iterate, add evals, measure quality</li>
              <li>Week 3+: productionization, monitoring, handoff</li>
            </ul>
          </div>
          <div className="neu-card p-6">
            <h2 className="text-lg font-semibold">Good Fit If</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>You need grounded answers, not demos</li>
              <li>You care about failure modes and reliability</li>
              <li>You want clear scope and clean delivery</li>
            </ul>
          </div>
        </div>

        <PricingSection
          title="Pricing"
          subtitle="Choose a tier or start with a call. I’ll recommend the smallest thing that gets you real value."
          tiers={tiers}
          frequencies={frequencies}
        />

        <div className="mt-10 neu-flat rounded-2xl p-6 text-sm text-muted-foreground">
          Prefer async-first? Email me a short description of your goal, your data sources, and what “success” looks like.
        </div>
      </div>
    </Container>
  );
}
