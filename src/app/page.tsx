"use client";

import { Container } from "@/components/Container";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/services-section";
import { SkillsSection } from "@/components/home/skills-section";
import { SocialProofSection } from "@/components/home/social-proof-section";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
import { NewsletterSection } from "@/components/newsletter/newsletter-section";
import {
  WebsiteStructuredData,
  PersonStructuredData,
  FAQStructuredData,
  BreadcrumbStructuredData,
} from "@/components/ui/structured-data";
import Link from "next/link";
import { ArrowRight, Rocket, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";

const currentFocusItems = [
  {
    icon: Rocket,
    title: "Building AI Products",
    description:
      "Turning RAG research into production-ready applications. Currently exploring multi-modal retrieval and agentic workflows.",
    link: "/blog",
    linkText: "Read my AI insights",
  },
  {
    icon: BookOpen,
    title: "Writing & Teaching",
    description:
      "Sharing what I learn through blog posts and open-source projects. Making complex topics accessible to everyone.",
    link: "/blog",
    linkText: "Check out my blog",
  },
  {
    icon: Users,
    title: "Community Building",
    description:
      "Contributing to open source, helping others learn to code, and organizing local tech meetups in SoCal.",
    link: "/about",
    linkText: "Learn more about me",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Structured Data */}
      <WebsiteStructuredData
        url="https://lscaturchio.xyz"
        name="Lorenzo Scaturchio | Data Scientist & AI Developer"
        description="Lorenzo Scaturchio's personal site - building intelligent applications, contributing to open source, and exploring the intersection of AI and user-friendly software. Based in Southern California."
        siteType="Portfolio"
      />
      <PersonStructuredData
        name="Lorenzo Scaturchio"
        description="Data Scientist and Developer specializing in AI, machine learning, RAG systems, and full-stack web development"
        image="https://lscaturchio.xyz/images/portrait.webp"
        jobTitle="Data Scientist & AI Developer"
        url="https://lscaturchio.xyz"
        sameAs={[
          "https://github.com/gr8monk3ys",
          "https://linkedin.com/in/lscaturchio",
          "https://twitter.com/lscaturchio",
        ]}
      />
      <BreadcrumbStructuredData
        items={[{ name: "Home", item: "https://lscaturchio.xyz" }]}
      />
      <FAQStructuredData
        questions={[
          {
            question: "What services does Lorenzo Scaturchio offer?",
            answer:
              "Lorenzo offers AI development (RAG systems, chatbots, NLP), data science consulting, full-stack web development, and technical consulting for businesses looking to leverage AI and data.",
          },
          {
            question: "How can I work with Lorenzo?",
            answer:
              "You can reach out through the contact form on the website, schedule a free consultation via Calendly, or send an email directly.",
          },
          {
            question: "What technologies does Lorenzo specialize in?",
            answer:
              "Lorenzo specializes in Python, TypeScript, React, Next.js, LangChain, OpenAI, and various data science and machine learning tools.",
          },
        ]}
      />

      {/* Screen reader only h1 */}
      <h1 className="sr-only">
        Lorenzo Scaturchio - Data Scientist and AI Developer Portfolio
      </h1>

      {/* Hero Section */}
      <Hero />

      {/* Services Section */}
      <ServicesSection />

      {/* Current Focus Section */}
      <Container size="large">
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Current Focus
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              What I&apos;m Working On
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A few things keeping me busy and excited these days
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentFocusItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-secondary/30 rounded-2xl p-8 hover:bg-secondary/50 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-6">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {item.description}
                </p>

                <Link
                  href={item.link}
                  className="inline-flex items-center text-sm font-medium text-primary group-hover:underline"
                >
                  {item.linkText}
                  <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </Container>

      {/* Skills Section */}
      <SkillsSection />

      {/* Recent Blog Posts */}
      <Container size="large">
        <RecentBlogs />
      </Container>

      {/* Social Proof / Stats */}
      <SocialProofSection />

      {/* Recent Projects */}
      <Container size="large">
        <RecentProjects />
      </Container>

      {/* Newsletter */}
      <NewsletterSection />

      {/* Final CTA */}
      <Container size="large">
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-12 text-center"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Build Something Amazing?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Whether you have a specific project in mind or just want to explore possibilities,
                I&apos;d love to hear from you. Let&apos;s turn your ideas into reality.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
                  >
                    Get in Touch
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="https://calendly.com/gr8monk3ys/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Schedule a Call
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      </Container>
    </main>
  );
}
