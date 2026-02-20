import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { Clock, BookOpen, Code, Lightbulb, MapPin } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { nowData } from "@/lib/now-data";

export const metadata: Metadata = {
  title: "Now - Lorenzo Scaturchio",
  description: "What I'm currently working on, learning, and focusing on. Updated regularly.",
};

export default function NowPage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">What I&apos;m Doing Now</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            A regularly updated snapshot of my current focus, inspired by{" "}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              nownownow.com
            </a>
            . Last updated: <span className="font-medium">{nowData.lastUpdatedLabel}</span>
          </Paragraph>
        </div>

        {/* Current Location */}
        <section className="mb-12 neu-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="neu-flat-sm rounded-xl p-2">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Location</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Currently based in{" "}
            <span className="font-medium text-foreground">{nowData.location.label}</span>,{" "}
            {nowData.location.detail}
          </p>
        </section>

        {/* Working On */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="neu-flat-sm rounded-xl p-2">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Working On</h2>
          </div>
          <div className="space-y-4">
            <div className="neu-card p-5">
              <h3 className="font-semibold text-lg mb-2">Client Projects</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {nowData.workingOn.clientProjects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="neu-card p-5">
              <h3 className="font-semibold text-lg mb-2">Personal Projects</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {nowData.workingOn.personalProjects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Learning */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="neu-flat-sm rounded-xl p-2">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Learning</h2>
          </div>
          <div className="space-y-4">
            <div className="neu-pressed rounded-xl p-5">
              <h3 className="font-semibold mb-2">Technical Skills</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                {nowData.learning.technicalSkills.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="neu-pressed rounded-xl p-5">
              <h3 className="font-semibold mb-2">Reading</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                {nowData.learning.reading.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="neu-pressed rounded-xl p-5">
              <h3 className="font-semibold mb-2">Courses</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                {nowData.learning.courses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Thinking About */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="neu-flat-sm rounded-xl p-2">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Thinking About</h2>
          </div>
          <div className="neu-card p-5">
            <ul className="space-y-3 text-muted-foreground">
              {nowData.thinkingAbout.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Footer */}
        <div className="neu-pressed rounded-2xl p-6">
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
