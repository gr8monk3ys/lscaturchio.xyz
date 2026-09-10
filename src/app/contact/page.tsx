import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/contact/ContactForm";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHead } from "@/components/ui/page-head";

export const metadata = buildPageMetadata({
  title: "Contact",
  description: "Get in touch with Lorenzo Scaturchio for consulting, collaboration, or contributions. Available via encrypted email (PGP) and Signal for secure communications.",
  path: "/contact",
});

export default function Contact() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto space-y-16">
        <PageHead
          className="mb-12"
          kicker="Get in touch"
          title="Tell me what you are trying to ship."
          blurb={
            <>
              Best fit for RAG + ML systems, architecture reviews, and automation work that needs to
              hold up in production. If you already know the goal, the data, or the constraint,
              you have enough to reach out.
            </>
          }
        >
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="https://calendly.com/gr8monk3ys/30min"
              target="_blank"
              rel="noopener noreferrer"
              /* Secondary, not primary. DESIGN.md allows one filled CTA per
                 view, and on this page that is the form's submit button — the
                 action the page is built around. Two fills also read as two
                 equally weighted asks, which is the opposite of guidance. */
              className="cta-secondary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              Book a call
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="mailto:lorenzosca7@protonmail.ch"
              className="neu-button inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:text-primary"
            >
              Email Directly
            </Link>
          </div>
        </PageHead>

        {/* Stacked hairline rows, not a three-up band. DESIGN.md's Don't list
            names "three-column feature tiles" as SaaS landing-page furniture,
            and its Layout section asks for "stacked rows separated by hairlines
            with the label above the title and the description below". This page
            had two such bands; the other one was removed entirely because every
            actionable item in it repeated a CTA from this masthead. */}
        <ul className="divide-y divide-border border-y border-border">
          {[
            {
              label: "RAG + ML delivery",
              blurb: "New builds, thin-slice prototypes, and scoped production systems.",
            },
            {
              label: "Architecture reviews",
              blurb: "Reliability, retrieval quality, cost, latency, and rollout risk.",
            },
            {
              label: "Fast decisions",
              blurb:
                "Short calls or async briefs both work if the problem is already clear enough.",
            },
          ].map((row) => (
            <li key={row.label} className="py-5">
              <h2 className="label-mono">{row.label}</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{row.blurb}</p>
            </li>
          ))}
        </ul>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="label-mono">Fastest way to get a useful reply</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Describe the outcome you want, not just the tool you want to use.</li>
              <li>Mention the data, systems, or constraints that make the problem real.</li>
              <li>Include timing if there is a real decision deadline.</li>
              <li>Links to docs, repos, or screenshots help a lot.</li>
            </ul>
          </div>

          <div>
            <h2 className="label-mono">Response expectations</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              I usually reply within one to two business days. Remote worldwide. If something is
              urgent, say why and when the decision needs to happen.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Prefer async? Send a short brief and I&apos;ll tell you what I would do first, what I
              would de-risk, and whether the scope makes sense before you commit to a bigger build.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-10">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
