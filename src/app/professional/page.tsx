import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { WorkTimeline } from "@/components/ui/work-timeline";
import { ResumeDownloadButton } from "@/components/ui/resume-download-button";

export const metadata = buildPageMetadata({
  title: "Professional",
  description: "Lorenzo Scaturchio's professional experience, technical skills, and work history in data science, machine learning, and web development.",
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
    <Container size="large">
      <div className="max-w-4xl mx-auto py-12 space-y-20">
        {/* Header — gallery masthead */}
        <header>
          <span className="label-mono block">Professional</span>
          <Heading className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Work &amp; Skills
          </Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            My professional journey in data science, machine learning, and web development.
            Building things that make data science more accessible.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

        {/* Skills Section */}
        <section>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-8">Technical Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <SkillCategory
              title="Machine Learning & AI"
              skills={[
                "Python",
                "PyTorch",
                "TensorFlow",
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
                "Neon PostgreSQL",
                "Data Visualization",
                "Statistical Modeling",
                "A/B Testing",
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
                "Rust",
              ]}
            />
          </div>
        </section>

        {/* Work Experience */}
        <section>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-8">Work Experience</h2>
          <WorkTimeline />
        </section>

        {/* Philosophy & Approach */}
        <section className="border-y border-border py-10">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-4">My Approach</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              I particularly enjoy creating solutions that make data science problems into open-source,
              user-friendly applications. Too much of this field is locked behind academic papers and
              complex tooling - I want to change that.
            </p>
            <p>
              My philosophy: Start simple, measure constantly, iterate based on real-world performance.
              Whether it&apos;s building RAG systems, data pipelines, or web applications, I focus on
              practical solutions that actually help people.
            </p>
            <p>
              I&apos;m a big fan of Richard Feynman&apos;s style of explaining complex topics in the simplest
              form - it&apos;s the best way to truly understand something. If you can&apos;t explain it simply,
              you don&apos;t understand it well enough.
            </p>
          </div>
        </section>

        {/* Current Focus */}
        <section>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-6">Current Focus</h2>
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

        {/* Download Resume */}
        <section className="flex flex-col items-center gap-4 py-8">
          <h2 className="font-display text-2xl font-bold tracking-tight">Want to work together?</h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            Download my resume or schedule a call to discuss your project. I&apos;m always interested
            in challenging problems and opportunities to build things that matter.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <ResumeDownloadButton />
            <a
              href="https://calendly.com/gr8monk3ys/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              Schedule a Call
            </a>
          </div>
        </section>
      </div>
    </Container>
  );
}
