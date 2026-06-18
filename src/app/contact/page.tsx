import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { ContactForm } from "@/components/contact/ContactForm";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = buildPageMetadata({
  title: "Contact",
  description: "Get in touch with Lorenzo Scaturchio for consulting, collaboration, or contributions. Available via encrypted email (PGP) and Signal for secure communications.",
  path: "/contact",
});

export default function Contact() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="mb-12">
          <span className="label-mono block">Get in touch</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">
            Tell me what you are trying to ship.
          </Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Best fit for RAG + ML systems, architecture reviews, and automation work that needs to
            hold up in production. If you already know the goal, the data, or the constraint,
            you have enough to reach out.
          </Paragraph>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="https://calendly.com/gr8monk3ys/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              Book a Call
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="mailto:lorenzosca7@protonmail.ch"
              className="neu-button inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:text-primary"
            >
              Email Directly
            </Link>
          </div>

          <hr className="gallery-rule mt-8" />
        </header>

        <div className="grid gap-6 sm:grid-cols-3 divide-border border-y border-border sm:divide-x">
          <div className="px-5 py-6">
            <h2 className="label-mono">RAG + ML Delivery</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              New builds, thin-slice prototypes, and scoped production systems.
            </p>
          </div>
          <div className="px-5 py-6">
            <h2 className="label-mono">Architecture Reviews</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Reliability, retrieval quality, cost, latency, and rollout risk.
            </p>
          </div>
          <div className="px-5 py-6">
            <h2 className="label-mono">Fast Decisions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Short calls or async briefs both work if the problem is already clear enough.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="label-mono">Fastest Way to Get a Useful Reply</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Describe the outcome you want, not just the tool you want to use.</li>
              <li>Mention the data, systems, or constraints that make the problem real.</li>
              <li>Include timing if there is a real decision deadline.</li>
              <li>Links to docs, repos, or screenshots help a lot.</li>
            </ul>
          </div>

          <div>
            <h2 className="label-mono">Response Expectations</h2>
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
