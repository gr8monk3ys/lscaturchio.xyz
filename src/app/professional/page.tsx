import { Container } from "@/components/Container";
import { WorkTimeline } from "@/components/ui/work-timeline";
import { DownloadButton } from "@/components/ui/download-button";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import { Code, Brain, Database, Laptop } from "lucide-react";

export const metadata: Metadata = {
  title: "Professional | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio's professional experience, technical skills, and work history in data science, machine learning, and web development.",
};

const SkillCategory = ({ icon: Icon, title, skills }: { icon: React.ElementType; title: string; skills: string[] }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="size-5" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge key={skill} variant="secondary" className="text-sm">
          {skill}
        </Badge>
      ))}
    </div>
  </div>
);

export default function ProfessionalPage() {
  return (
    <Container size="large">
      <div className="max-w-4xl mx-auto py-12 space-y-16">
        {/* Header */}
        <div>
          <Badge variant="secondary" className="mb-4">Professional Experience</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Work & Skills
          </h1>
          <p className="text-xl text-muted-foreground">
            My professional journey in data science, machine learning, and web development.
            Building things that make data science more accessible.
          </p>
        </div>

        {/* Skills Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Technical Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkillCategory
              icon={Brain}
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
              icon={Database}
              title="Data Science & Analytics"
              skills={[
                "Pandas",
                "NumPy",
                "SQL",
                "PostgreSQL",
                "Supabase",
                "Data Visualization",
                "Statistical Modeling",
                "A/B Testing",
              ]}
            />
            <SkillCategory
              icon={Code}
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
              icon={Laptop}
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
          <h2 className="text-3xl font-bold mb-8">Work Experience</h2>
          <WorkTimeline />
        </section>

        {/* Philosophy & Approach */}
        <section className="bg-accent/30 border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">My Approach</h2>
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
          <h2 className="text-3xl font-bold mb-6">Current Focus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-2">RAG Systems</h3>
              <p className="text-muted-foreground">
                Exploring different use cases for retrieval-augmented generation and making them more
                marketable. Basically trying to get paid for doing cool stuff.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-2">Open Source</h3>
              <p className="text-muted-foreground">
                Contributing to open-source projects and building tools that make data science more
                accessible. FOSS is how the internet should work.
              </p>
            </div>
          </div>
        </section>

        {/* Download Resume */}
        <section className="flex flex-col items-center gap-4 py-8">
          <h2 className="text-2xl font-bold">Want to work together?</h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            Download my resume or schedule a call to discuss your project. I&apos;m always interested
            in challenging problems and opportunities to build things that matter.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <DownloadButton href="/Lorenzo_resume_DS.pdf" />
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
