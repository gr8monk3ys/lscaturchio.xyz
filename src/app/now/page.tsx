import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { Clock, BookOpen, Code, Lightbulb, MapPin } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Now - Lorenzo Scaturchio",
  description: "What I'm currently working on, learning, and focusing on. Updated regularly.",
};

export default function NowPage() {
  const lastUpdated = "January 2025";

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
            . Last updated: <span className="font-medium">{lastUpdated}</span>
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
            Currently based in <span className="font-medium text-foreground">Southern California</span>,
            working remotely as a freelance AI consultant and developer.
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
                <li>Building production RAG systems with LangChain and Supabase</li>
                <li>Developing autonomous AI agents for enterprise clients</li>
                <li>Consulting on AI integration strategies</li>
              </ul>
            </div>

            <div className="neu-card p-5">
              <h3 className="font-semibold text-lg mb-2">Personal Projects</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Rebuilding this website with Next.js 14 App Router</li>
                <li>Creating open-source AI tools and templates</li>
                <li>Writing technical blog posts about AI engineering</li>
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
                <li>Advanced prompt engineering techniques</li>
                <li>Fine-tuning LLMs with LoRA and QLoRA</li>
                <li>Vector database optimization (Pinecone, Weaviate)</li>
                <li>Next.js 14 Server Components deep dive</li>
              </ul>
            </div>

            <div className="neu-pressed rounded-xl p-5">
              <h3 className="font-semibold mb-2">Reading</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                <li><em>The Alignment Problem</em> by Brian Christian</li>
                <li><em>Designing Data-Intensive Applications</em> by Martin Kleppmann</li>
                <li>Research papers on retrieval-augmented generation</li>
              </ul>
            </div>

            <div className="neu-pressed rounded-xl p-5">
              <h3 className="font-semibold mb-2">Courses</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                <li>DeepLearning.AI - Building LLM Applications</li>
                <li>Full Stack LangChain course</li>
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
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>How to build AI systems that are truly helpful rather than just impressive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>The future of knowledge work in an AI-augmented world</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>Balancing technical sophistication with practical utility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>The ethical implications of autonomous AI systems</span>
              </li>
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
            Want to collaborate on something? <a href="/contact" className="text-primary hover:underline">Get in touch</a>.
          </p>
        </div>
      </div>
    </Container>
  );
}
