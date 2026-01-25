"use client";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { ResumeDownloadButton } from "@/components/ui/resume-download-button";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code,
  MessageSquare,
  Sparkles,
  User,
  Lightbulb,
  Rocket,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Featured content - can be updated as needed
const featuredPosts = [
  {
    slug: "building-rag-systems",
    title: "Building RAG Systems: A Practical Guide",
    description: "Learn how to build retrieval-augmented generation systems from scratch.",
  },
  {
    slug: "ai-in-everyday-life",
    title: "AI in Everyday Life",
    description: "Exploring how artificial intelligence is transforming daily experiences.",
  },
  {
    slug: "data-science-journey",
    title: "My Data Science Journey",
    description: "From curiosity to career: how I found my path in data science.",
  },
];

const featuredProjects = [
  {
    slug: "leetcode-solver-bot",
    title: "LeetCode Solver Bot",
    description: "An automated bot that solves LeetCode problems using GPT-4.",
    href: "https://github.com/gr8monk3ys/leetcode-solver",
  },
  {
    slug: "talker",
    title: "Talker - Teaching Assistant RAG",
    description: "An open source teaching assistant leveraging OLlama2 with a FAISS knowledge base.",
    href: "https://github.com/gr8monk3ys/TAlker",
  },
  {
    slug: "ai-powered-trading-bot",
    title: "AI-Powered Trading Bot",
    description: "An advanced AI-driven stock trading bot with sentiment analysis.",
    href: "https://github.com/gr8monk3ys/trading-bot",
  },
];

const quickLinks = [
  {
    icon: User,
    title: "About Me",
    description: "Learn about my background, interests, and what drives me.",
    href: "/about",
  },
  {
    icon: BookOpen,
    title: "Blog",
    description: "Thoughts on AI, data science, web development, and more.",
    href: "/blog",
  },
  {
    icon: Code,
    title: "Projects",
    description: "Open source projects and things I have built.",
    href: "/projects",
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    description: "Ask my AI assistant anything about my work or the site.",
    href: "/chat",
  },
];

export default function StartHerePage() {
  return (
    <Container size="large">
      {/* Hero Section */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={stagger}
        className="text-center mb-16"
      >
        <motion.div variants={fadeInUp} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Welcome to my corner of the internet
          </span>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Heading className="font-black mb-6 text-4xl md:text-5xl lg:text-6xl">
            Start Here
          </Heading>
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
        >
          Hey there! I am Lorenzo, a data scientist and developer from Southern California.
          I build AI systems, contribute to open source, and write about technology.
          This page will help you find your way around.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/about"
            className="neu-button bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all inline-flex items-center gap-2"
          >
            Learn About Me
            <ArrowRight className="h-4 w-4" />
          </Link>
          <ResumeDownloadButton variant="outline" />
        </motion.div>
      </motion.section>

      {/* New Here Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <div className="neu-card p-8 md:p-10 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start gap-4 mb-6">
            <div className="neu-flat-sm rounded-xl p-3">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">New Here? Start With These</h2>
              <p className="text-muted-foreground">
                A suggested reading path to get the most out of this site.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="neu-pressed rounded-xl p-5">
              <span className="text-primary font-bold text-lg">1</span>
              <h3 className="font-semibold mt-2 mb-1">Read the About Page</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get to know who I am and what I am working on.
              </p>
              <Link href="/about" className="text-primary text-sm hover:underline inline-flex items-center gap-1">
                Go to About <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="neu-pressed rounded-xl p-5">
              <span className="text-primary font-bold text-lg">2</span>
              <h3 className="font-semibold mt-2 mb-1">Explore the Blog</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Dive into articles on AI, data science, and development.
              </p>
              <Link href="/blog" className="text-primary text-sm hover:underline inline-flex items-center gap-1">
                Browse Blog <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="neu-pressed rounded-xl p-5">
              <span className="text-primary font-bold text-lg">3</span>
              <h3 className="font-semibold mt-2 mb-1">Try the AI Chat</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ask questions and get personalized recommendations.
              </p>
              <Link href="/chat" className="text-primary text-sm hover:underline inline-flex items-center gap-1">
                Start Chatting <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quick Links Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link href={link.href} className="block h-full">
                <div className="neu-card p-6 h-full hover:scale-[1.02] transition-transform">
                  <div className="neu-flat-sm rounded-xl p-3 w-fit mb-4">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Blog Posts */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular Articles</h2>
          <Link href="/blog" className="text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="neu-card p-6 h-full hover:scale-[1.02] transition-transform">
                  <div className="neu-flat-sm rounded-lg p-2 w-fit mb-4">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">{post.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Projects */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-16"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Projects</h2>
          <Link href="/projects" className="text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <a href={project.href} target="_blank" rel="noopener noreferrer" className="block">
                <div className="neu-card p-6 h-full hover:scale-[1.02] transition-transform">
                  <div className="neu-flat-sm rounded-lg p-2 w-fit mb-4">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Newsletter CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-16"
      >
        <div className="neu-card p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Stay in the Loop
              </h2>
              <p className="text-muted-foreground mb-4">
                Get notified when I publish new articles, release projects, or share
                insights on AI and data science. No spam, unsubscribe anytime.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Weekly insights on AI and data science
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Early access to new projects
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Exclusive content and resources
                </li>
              </ul>
            </div>
            <div className="neu-pressed rounded-2xl p-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Connect Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Ready to Connect?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Whether you have a project idea, want to collaborate, or just want to say hi,
          I would love to hear from you.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/contact"
            className="neu-button bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all inline-flex items-center gap-2"
          >
            Get in Touch
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="https://calendly.com/gr8monk3ys/30min"
            className="neu-button px-6 py-3 rounded-xl font-medium text-foreground hover:text-primary transition-all"
          >
            Schedule a Call
          </Link>
        </div>
      </motion.section>
    </Container>
  );
}
