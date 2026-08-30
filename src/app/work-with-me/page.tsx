import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import ServicesSection from "@/components/services/service-section";
import { FaqSection } from "@/components/services/faq-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { testimonials } from "@/constants/testimonials";
import { questions } from "@/constants/questions";
import { ArrowUpRight, CalendarDays, CheckCircle2, Mail, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Work With Me",
  description: "AI engineering, RAG systems, and practical automation. Clear scope, fast iteration, production-ready delivery.",
};

const fitSignals = [
  "You need grounded answers, not a flashy demo.",
  "You care about reliability, cost, and failure modes.",
  "You want clear scope and fast iteration with real checkpoints.",
];

const sprintPlan = [
  "Align on the goal, the user, and the constraint that matters most.",
  "Ship the smallest end-to-end workflow with real data and measurable output.",
  "Add guardrails, instrumentation, and a rollout path that a team can keep running.",
];

const deliveryCards = [
  {
    title: "What I Usually Build",
    items: [
      "RAG and search systems with citations, evals, and observability.",
      "Agent workflows and automation that reduce manual operational work.",
      "Architecture reviews for LLM apps that need lower latency and better reliability.",
    ],
  },
  {
    title: "Where Projects Usually Break",
    items: [
      "The prototype works, but nobody defined the real acceptance criteria.",
      "Costs rise because retrieval, prompts, and failure handling stayed ad hoc.",
      "The team has no clean path from pilot to production ownership.",
    ],
  },
  {
    title: "What You Leave With",
    items: [
      "A working slice of the system that can be shown, tested, and measured.",
      "A clearer roadmap for what to automate, what to delay, and what to monitor.",
      "Documentation and decisions that make the next handoff cleaner.",
    ],
  },
];

export default function WorkWithMePage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 space-y-6">
          <section className="rounded-[1.75rem] border border-border/60 bg-background/85 p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Engineering + RAG Delivery
            </div>
            <h1 className="text-page-title mt-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Ship the smallest reliable version first.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground selection:bg-primary/20 selection:text-primary md:text-lg">
              I help teams turn vague AI ideas into working systems with clear scope, measured quality,
              and production-minded delivery. The goal is not a demo. The goal is something a team can
              trust, evaluate, and keep improving.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="https://calendly.com/gr8monk3ys/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                <CalendarDays className="h-4 w-4" />
                Schedule a Call
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="neu-button inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 text-primary" />
                Send a Project Brief
              </Link>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="neu-flat rounded-2xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Best Fit
              </h2>
              <ul className="mt-4 space-y-3">
                {fitSignals.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="neu-card p-6">
              <h2 className="text-lg font-semibold">Typical First Sprint</h2>
              <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
                {sprintPlan.map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="neu-pressed rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Availability</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Currently taking on new consulting and build engagements. Remote-first, with short
                advisory work and hands-on implementation both available.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {deliveryCards.map((card) => (
            <div key={card.title} className="neu-card p-6">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section
          id="services"
          className="scroll-mt-28 mb-10"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Services</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Scope, approach, and implementation details for how I ship client work.
            </p>
          </div>
          <div className="neu-card">
            <ServicesSection />
          </div>
        </section>

        <section
          id="faq"
          className="scroll-mt-28 mb-10"
        >
          <FaqSection
            title="Frequently Asked Questions"
            description="Answers to common questions about delivery, scope, and communication."
            items={questions}
            contactInfo={{
              title: "Still have questions?",
              description: "Book a short call and I can tell you exactly what I would do first.",
              buttonText: "Schedule a Call",
              contactUrl: "https://calendly.com/gr8monk3ys/30min",
            }}
          />
        </section>

        {testimonials.length > 0 && (
          <section
            id="testimonials"
            className="scroll-mt-28 mb-10"
          >
            <TestimonialsSection
              showAll
              title="Testimonials"
              description="Feedback from people I have built with across AI, product, and software projects."
            />
          </section>
        )}

        <div id="pricing" className="scroll-mt-28">
          <h2 className="font-bold text-2xl md:text-3xl tracking-tight">What it costs</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Engagements start around <strong className="text-foreground">$5,000</strong> for a scoped
            first sprint — enough to ship one end-to-end slice with real data and a measurement you
            can argue with. Longer builds and advisory retainers are quoted once the scope is real.
          </p>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            I don&apos;t quote a number before understanding the constraint, and I&apos;ll say so if
            the smallest useful version costs less than you expected.
          </p>
        </div>

        <div
          id="contact"
          className="mt-10 scroll-mt-28 neu-flat rounded-2xl p-6 text-sm text-muted-foreground"
        >
          Prefer async-first? Send the goal, the user, the data sources, and the constraint that matters most.
          I&apos;ll tell you what I would de-risk first and whether the scope makes sense. Want the background
          first? My skills and work history live on the{" "}
          {/* Underlined at rest: inside a paragraph, colour alone does not
              distinguish a link (WCAG 1.4.1). */}
          <Link href="/professional" className="text-primary underline underline-offset-4">
            experience page
          </Link>
          .
        </div>
      </div>
    </Container>
  );
}
