import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { HowIWorkSection } from "@/components/home/how-i-work-section";
import { FaqSection } from "@/components/services/faq-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { testimonials } from "@/constants/testimonials";
import { questions } from "@/constants/questions";
import { SERVICES } from "@/constants/services";
import { ArrowUpRight } from "lucide-react";
import { LedgerChips, LedgerRows, ordinal } from "@/components/ui/ledger-section";

export const metadata: Metadata = {
  title: "Work with me",
  description:
    "AI engineering, RAG systems, and practical automation. Clear scope, fast iteration, production-ready delivery.",
};

const CALL_URL = "https://calendly.com/gr8monk3ys/30min";

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

const usuallyBuild = [
  "RAG and search systems with citations, evals, and observability.",
  "Agent workflows and automation that reduce manual operational work.",
  "Architecture reviews for LLM apps that need lower latency and better reliability.",
];

const whereItBreaks = [
  "The prototype works, but nobody defined the real acceptance criteria.",
  "Costs rise because retrieval, prompts, and failure handling stayed ad hoc.",
  "The team has no clean path from pilot to production ownership.",
];

const leaveWith = [
  "A working slice of the system that can be shown, tested, and measured.",
  "A clearer roadmap for what to automate, what to delay, and what to monitor.",
  "Documentation and decisions that make the next handoff cleaner.",
];

/**
 * One row of the engagement ledger: a mono label in the margin, the entry
 * beside it, a hairline beneath. The same register as the essay index and the
 * process list, so the hirer reads the same notebook the reader does.
 */
function LedgerRow({
  label,
  children,
  id,
}: {
  label: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="grid gap-x-8 gap-y-2 border-b border-border py-7 scroll-mt-28 md:grid-cols-[11rem_1fr]"
    >
      <span className="label-mono pt-1">{label}</span>
      <div className="min-w-0 max-w-lg">{children}</div>
    </div>
  );
}

function LedgerList({ items, numbered = false }: { items: string[]; numbered?: boolean }) {
  return (
    <LedgerRows items={items} numbered={numbered} className="space-y-2.5">
      {(item, entryNumber) => (
        <li key={item} className="grid grid-cols-[1.75rem_1fr] gap-x-2 text-sm leading-relaxed text-foreground/85">
          <span className="label-mono pt-1 tabular-nums" aria-hidden>
            {entryNumber ?? "—"}
          </span>
          <span>{item}</span>
        </li>
      )}
    </LedgerRows>
  );
}

export default function WorkWithMePage() {
  return (
    <Container className="mt-16 lg:mt-24">
      <div className="mx-auto max-w-7xl">
        {/* Masthead: one headline, one thesis, one action. */}
        <header className="max-w-3xl px-4 sm:px-6 lg:px-8">
          <span className="label-mono block">Work with me · Remote · Los Angeles</span>
          <h1 className="text-page-title mt-5 text-balance text-foreground">
            Ship the smallest reliable version first.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            I help teams turn vague AI ideas into working systems with clear scope, measured
            quality, and a delivery a team can keep running. The goal is not a demo. The goal is
            something you can trust, evaluate, and keep improving.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={CALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm"
            >
              Schedule a call
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="label-mono text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Or send a brief →
            </Link>
          </div>
        </header>

        {/* The engagement, as a ledger. Price first: it is the question every
            visitor to this page is actually asking. */}
        <section aria-label="The engagement" className="mt-14 border-t border-border px-4 sm:px-6 lg:px-8">
          <LedgerRow label="What it costs" id="pricing">
            <p className="text-sm leading-relaxed text-foreground/85">
              Engagements start around{" "}
              <strong className="font-semibold text-foreground">$5,000</strong> for a scoped
              first sprint: enough to ship one end-to-end slice with real data and a measurement
              you can argue with. Longer builds and advisory retainers are quoted once the scope
              is real.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              I don&apos;t quote a number before understanding the constraint, and I&apos;ll say
              so if the smallest useful version costs less than you expected.
            </p>
          </LedgerRow>

          <LedgerRow label="Best fit">
            <LedgerList items={fitSignals} />
          </LedgerRow>

          <LedgerRow label="First sprint">
            <LedgerList items={sprintPlan} numbered />
          </LedgerRow>

          <LedgerRow label="What I usually build">
            <LedgerList items={usuallyBuild} />
          </LedgerRow>

          <LedgerRow label="Where projects break">
            <LedgerList items={whereItBreaks} />
          </LedgerRow>

          <LedgerRow label="What you leave with">
            <LedgerList items={leaveWith} />
          </LedgerRow>

          <LedgerRow label="Availability">
            <p className="text-sm leading-relaxed text-foreground/85">
              Taking on new consulting and build engagements. Remote-first, with short advisory
              work and hands-on implementation both available.
            </p>
          </LedgerRow>
        </section>

        <HowIWorkSection />

        {/* Services: every service and every facet on the page at once, as
            stacked entries. Nothing to click to find out what is on offer. */}
        <section id="services" className="scroll-mt-28 border-t border-border py-16 px-4 sm:px-6 lg:px-8">
          <span className="label-mono block">Services</span>
          <h2 className="text-section-title mt-3">What the work looks like</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Scope, approach, and what I actually ship, for each kind of engagement.
          </p>

          <div className="mt-10 space-y-14">
            {SERVICES.map((service, serviceIndex) => (
              <article
                key={service.title}
                className="grid gap-x-8 gap-y-6 border-t border-border pt-8 lg:grid-cols-[minmax(240px,320px)_1fr]"
              >
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <span className="label-mono block">
                    {ordinal(serviceIndex)}
                  </span>
                  <h3 className="text-card-title mt-2">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{service.subtitle}</p>
                </div>

                <dl className="divide-y divide-border border-y border-border">
                  {service.tabs.map((tab) => (
                    <div key={tab.name} className="grid gap-x-6 gap-y-2 py-5 md:grid-cols-[9rem_1fr]">
                      <dt className="label-mono pt-1">{tab.name}</dt>
                      <dd className="min-w-0">
                        <p className="max-w-lg text-sm leading-relaxed text-foreground/85">
                          {tab.content}
                        </p>
                        <LedgerChips
                          items={tab.features}
                          className="mt-3"
                          itemClassName="normal-case tracking-normal text-foreground/65"
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="scroll-mt-28 border-t border-border">
          <FaqSection
            title="Questions people ask first"
            description="Delivery, scope, and how we would talk to each other."
            items={questions}
            contactInfo={{
              title: "Still have questions?",
              description: "Book a short call and I can tell you exactly what I would do first.",
              buttonText: "Schedule a call",
              contactUrl: CALL_URL,
            }}
          />
        </section>

        {testimonials.length > 0 && (
          <section id="testimonials" className="scroll-mt-28 border-t border-border py-16 px-4 sm:px-6 lg:px-8">
            <TestimonialsSection
              showAll
              title="Testimonials"
              description="Feedback from people I have built with across AI, product, and software projects."
            />
          </section>
        )}

        <section id="contact" className="scroll-mt-28 border-t border-border py-12 px-4 sm:px-6 lg:px-8">
          <span className="label-mono block">Prefer async?</span>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Send the goal, the user, the data sources, and the constraint that matters most.
            I&apos;ll tell you what I would de-risk first and whether the scope makes sense. Want
            the background first? My skills and work history live on the{" "}
            {/* Underlined at rest: inside a paragraph, colour alone does not
                distinguish a link (WCAG 1.4.1). */}
            <Link href="/professional" className="text-primary underline underline-offset-4">
              experience page
            </Link>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
