import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { nowData, getNowFreshness } from "@/lib/now-data";

export const metadata = buildPageMetadata({
  title: "Now - Lorenzo Scaturchio",
  description: "What I'm currently working on, learning, and focusing on. Updated regularly.",
  path: "/now",
});

// Re-evaluate the staleness banner at least daily without a rebuild.
export const revalidate = 86400;

export default function NowPage() {
  const { isStale, daysSinceUpdate } = getNowFreshness();
  const monthsSinceUpdate = Math.floor(daysSinceUpdate / 30);

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-3xl mx-auto">
        {/* Header — gallery masthead */}
        <header className="mb-12">
          <span className="label-mono block">Garden · Now</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">What I&apos;m Doing Now</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A regularly updated snapshot of my current focus, inspired by{" "}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              nownownow.com
            </a>
            . Last updated: <span className="font-medium text-foreground">{nowData.lastUpdatedLabel}</span>
          </Paragraph>
          {isStale && (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 border-l-2 border-primary pl-4 text-sm text-muted-foreground"
            >
              <AlertTriangle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                Heads up: this snapshot is about {monthsSinceUpdate} months old, so
                some of it may be out of date. I keep this honest rather than
                pretending otherwise.
              </span>
            </div>
          )}
          <hr className="gallery-rule mt-8" />
        </header>

        {/* Current Location */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Location</h2>
          <p className="text-muted-foreground leading-relaxed">
            Currently based in{" "}
            <span className="font-medium text-foreground">{nowData.location.label}</span>,{" "}
            {nowData.location.detail}
          </p>
        </section>

        {/* Working On */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">Working On</h2>
          <div className="divide-y divide-border border-y border-border">
            <div className="py-6">
              <h3 className="label-mono mb-3">Client Projects</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {nowData.workingOn.clientProjects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="py-6">
              <h3 className="label-mono mb-3">Personal Projects</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {nowData.workingOn.personalProjects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Learning */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">Learning</h2>
          <div className="divide-y divide-border border-y border-border">
            <div className="py-6">
              <h3 className="label-mono mb-3">Technical Skills</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                {nowData.learning.technicalSkills.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="py-6">
              <h3 className="label-mono mb-3">Reading</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                {nowData.learning.reading.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="py-6">
              <h3 className="label-mono mb-3">Courses</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                {nowData.learning.courses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Thinking About */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">Thinking About</h2>
          <ul className="space-y-3 text-muted-foreground">
            {nowData.thinkingAbout.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            This page is inspired by Derek Sivers&apos;{" "}
            <a
              href="https://sive.rs/nowff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              /now page movement
            </a>
            . It&apos;s a reminder to stay focused on what truly matters right now, rather than maintaining an exhaustive list of everything I could be doing.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Want to collaborate on something?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}
