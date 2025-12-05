import { Container } from "@/components/Container";
import { Products } from "@/components/projects/Products";
import { Metadata } from "next";
import { Suspense } from "react";
import { Code2, GitFork, Star, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projects | Lorenzo Scaturchio",
  description:
    "Explore Lorenzo Scaturchio's open source projects and applications. From AI-powered tools to full-stack web applications, see what I've been building.",
};

const featuredProjects = [
  {
    title: "AI-Powered Trading Bot",
    description:
      "An advanced AI-driven stock trading bot leveraging FinBERT sentiment analysis and technical indicators for automated trading strategies.",
    href: "https://github.com/gr8monk3ys/trading-bot",
    tags: ["Python", "FinBERT", "Alpaca API", "Machine Learning"],
  },
  {
    title: "TAlker - Teaching Assistant RAG",
    description:
      "An open source teaching assistant using LLama2 with a FAISS knowledge base to answer student questions based on course materials.",
    href: "https://github.com/gr8monk3ys/TAlker",
    tags: ["Python", "FAISS", "LLama2", "RAG"],
  },
  {
    title: "Blog-AI",
    description:
      "AI content generation tool leveraging GPT-4 and LangChain to automatically create SEO-optimized blog posts and structured books.",
    href: "https://github.com/gr8monk3ys/blog-AI",
    tags: ["Python", "OpenAI", "LangChain", "Content Generation"],
  },
];

export default function Projects() {
  return (
    <Container size="large">
      {/* Header Section */}
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Projects & Open Source
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            I love building things and sharing them with the world. Here&apos;s a collection
            of my open source projects, from AI-powered applications to developer tools.
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-6 mt-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Code2 className="w-5 h-5" />
            <span>30+ repositories</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Open source contributor</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GitFork className="w-5 h-5" />
            <span>Always learning</span>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Highlighted
            </span>
            <h2 className="text-2xl font-bold mt-1">Featured Projects</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Projects */}
      <section className="py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              All Repositories
            </span>
            <h2 className="text-2xl font-bold mt-1">Browse All Projects</h2>
          </div>
          <Link
            href="https://github.com/gr8monk3ys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            View on GitHub
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-secondary/50 h-[200px]"
                />
              ))}
            </div>
          }
        >
          <Products />
        </Suspense>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 mb-12">
        <div className="bg-secondary/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Have a project idea?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            I&apos;m always open to collaborating on interesting projects or discussing
            new opportunities. Let&apos;s build something together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Get in Touch
            </Link>
            <Link
              href="https://github.com/gr8monk3ys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-colors"
            >
              Follow on GitHub
            </Link>
          </div>
        </div>
      </section>
    </Container>
  );
}
