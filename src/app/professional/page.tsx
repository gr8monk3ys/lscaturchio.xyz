import Link from "next/link";

import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { WorkTimeline } from "@/components/ui/work-timeline";
import { ResumeDownloadButton } from "@/components/ui/resume-download-button";
import { PageHead } from "@/components/ui/page-head";

export const metadata = buildPageMetadata({
  title: "Professional",
  description: "Where Lorenzo Scaturchio has worked, what he shipped there, and the numbers each claim is sourced against.",
  path: "/professional",
});

const SkillCategory = ({ title, skills }: { title: string; skills: string[] }) => (
  <div className="space-y-3">
    <h3 className="label-mono">{title}</h3>
    <p className="text-lg text-foreground">{skills.join("  ·  ")}</p>
  </div>
);

export default function ProfessionalPage() {
  return (
    <Container size="wide">
      <div className="max-w-4xl mx-auto py-12 space-y-20">
        {/* Header — gallery masthead */}
        <PageHead
          kicker="Professional"
          title="Work and skills"
          blurb={
            <>
              Where I have worked and what I shipped there. Every number below is
              reconciled against my resume; where a figure is private, this page says
              so rather than estimating.
            </>
          }
        />

        {/* Skills Section */}
        <section>
          <h2 className="text-section-title mb-8">Technical skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <SkillCategory
              title="Machine Learning & AI"
              skills={[
                "Python",
                "PyTorch",
                "Scikit-learn",
                "LangChain",
                "OpenAI API",
                "RAG Systems",
                "Vector Databases",
                "Hugging Face",
              ]}
            />
            <SkillCategory
              title="Data Science & Analytics"
              skills={[
                "Pandas",
                "NumPy",
                "SQL",
                "PostgreSQL",
                "Apache Kafka",
                "Spark Streaming",
                "Snowflake",
                "Statistical Modeling",
              ]}
            />
            <SkillCategory
              title="Web Development"
              skills={[
                "TypeScript",
                "React",
                "Next.js",
                "Tailwind CSS",
                "Node.js",
                "FastAPI",
                "REST APIs",
                "GraphQL",
              ]}
            />
            <SkillCategory
              title="Tools & Infrastructure"
              skills={[
                "Git",
                "Docker",
                "Linux (Arch btw)",
                "Neovim",
                "Vercel",
                "AWS",
                "CI/CD",
              ]}
            />
          </div>
        </section>

        {/* Work Experience */}
        <section>
          <h2 className="text-section-title mb-8">Work experience</h2>
          <WorkTimeline />
        </section>

        {/* Philosophy & Approach */}
        <section className="border-y border-border py-10">
          <h2 className="text-section-title mb-4">How I work</h2>
          <div className="max-w-2xl space-y-4 text-muted-foreground">
            <p>
              Most of this field is locked behind academic papers and tooling that assumes
              you already know the answer. The work I like best takes something that only
              runs in a notebook and turns it into something a person can open.
            </p>
            <p>
              Start simple, measure, then change it based on what the measurement said.
              That order matters more than which framework is involved.
            </p>
            <p>
              If you can&apos;t explain it simply, you don&apos;t understand it well enough.
              Feynman said it first and I have not found a counterexample.
            </p>
          </div>
        </section>

        {/* Current Focus */}
        <section>
          <h2 className="text-section-title mb-6">Current focus</h2>
          <div className="grid grid-cols-1 divide-border border-y border-border md:grid-cols-2 md:divide-x">
            <div className="px-0 py-6 md:pr-8">
              <h3 className="label-mono">RAG Systems</h3>
              <p className="mt-3 text-muted-foreground">
                Exploring different use cases for retrieval-augmented generation and making them more
                marketable. Basically trying to get paid for doing cool stuff.
              </p>
            </div>
            <div className="px-0 py-6 md:pl-8">
              <h3 className="label-mono">Open Source</h3>
              <p className="mt-3 text-muted-foreground">
                Contributing to open-source projects and building tools that make data science more
                accessible. FOSS is how the internet should work.
              </p>
            </div>
          </div>
        </section>

        {/* The resume. This block used to be centre-aligned — the only centred
            composition on a site whose every other placard, row and rule hangs
            off the left margin. */}
        <section className="border-t border-border pt-10">
          <h2 className="text-section-title">The resume</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            The same history as a PDF, kept in sync with this page. A call works too if you
            would rather ask than read.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <ResumeDownloadButton />
            <a
              href="https://calendly.com/gr8monk3ys/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium"
            >
              Schedule a call
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Hiring for a project?{" "}
            <Link href="/work-with-me" className="text-primary underline-offset-4 hover:underline">
              See how I work with clients
            </Link>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
