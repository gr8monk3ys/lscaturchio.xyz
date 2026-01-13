"use client";

import { Container } from "@/components/Container";
import { motion, useScroll, useTransform } from "framer-motion";
import { Hero } from "@/components/home/Hero";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { WebsiteStructuredData, PersonStructuredData, FAQStructuredData, BreadcrumbStructuredData } from "@/components/ui/structured-data";
import Link from "next/link";
import { ArrowRight, Code, Database, Brain, Server } from "lucide-react";

const fadeInUp = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <WebsiteStructuredData
        url="https://lscaturchio.xyz"
        name="Lorenzo Scaturchio | Data Scientist & Developer"
        description="Lorenzo Scaturchio's personal site - building RAG systems, contributing to open source, and exploring the intersection of AI and user-friendly applications. Based in Southern California."
        siteType="Portfolio"
      />
      <PersonStructuredData
        name="Lorenzo Scaturchio"
        description="Data Scientist and Developer specializing in machine learning, data analysis, and web development"
        image="https://lscaturchio.xyz/images/portrait.webp"
        jobTitle="Data Scientist & Developer"
        url="https://lscaturchio.xyz"
        sameAs={[
          "https://github.com/lscaturchio",
          "https://linkedin.com/in/lscaturchio",
          "https://twitter.com/lscaturchio"
        ]}
      />
      <BreadcrumbStructuredData
        items={[
          {
            name: "Home",
            item: "https://lscaturchio.xyz"
          }
        ]}
      />
      <FAQStructuredData
        questions={[
          {
            question: "What services does Lorenzo Scaturchio offer?",
            answer: "Lorenzo Scaturchio offers data science consulting, machine learning solutions, web application development, and custom digital experiences for businesses and individuals."
          },
          {
            question: "How can I contact Lorenzo Scaturchio?",
            answer: "You can reach out through the contact form on the website or schedule a meeting via the provided Calendly link."
          }
        ]}
      />
      
      <Container size="large">
        <h1 className="sr-only">Lorenzo Scaturchio - Data Scientist and Developer Portfolio</h1>
        <Hero />
        
        <section className="my-16 px-4">
          <h2 className="text-3xl font-bold text-center mb-4">What I&apos;m Currently Working On</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            A few things keeping me busy these days
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="neu-card p-6">
              <div className="neu-flat-sm rounded-xl p-3 w-fit mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Building RAG Systems</h3>
              <p className="text-muted-foreground mb-4">Exploring different use cases for retrieval-augmented generation systems and making them more marketable (basically trying to get paid for doing cool stuff).</p>
              <Link href="/blog" className="text-primary hover:underline flex items-center">
                Read my thoughts <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="neu-card p-6">
              <div className="neu-flat-sm rounded-xl p-3 w-fit mb-4">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Open-Source Contribution</h3>
              <p className="text-muted-foreground mb-4">Navigating different types of project ideas and continually pushing for open-source contribution. Making data science problems more user-friendly.</p>
              <Link href="/projects" className="text-primary hover:underline flex items-center">
                See my projects <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="neu-card p-6">
              <div className="neu-flat-sm rounded-xl p-3 w-fit mb-4">
                <Server className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Impact</h3>
              <p className="text-muted-foreground mb-4">Actively looking to better others around me, be it volunteer work like a tool loaning workshop or helping people learn to code.</p>
              <Link href="/about" className="text-primary hover:underline flex items-center">
                Learn more about me <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        
        <RecentBlogs />
        <RecentProjects />
      </Container>

      {/* Unified CTA Section */}
      <section className="w-full px-4 md:px-6 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="neu-card p-8 lg:p-12">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Left: Contact CTA */}
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Let&apos;s Build Something <span className="text-primary">Together</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  I&apos;m always interested in new projects and collaborations. Whether you need AI solutions,
                  data analysis, or a web application, I&apos;d love to hear from you.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link
                    href="https://calendly.com/gr8monk3ys/30min"
                    className="neu-button bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Schedule a Call
                  </Link>
                  <Link
                    href="/services"
                    className="neu-button px-6 py-3 rounded-xl font-medium text-foreground hover:text-primary transition-all"
                  >
                    View Services
                  </Link>
                </div>
              </div>

              {/* Right: Newsletter Form */}
              <div className="neu-pressed rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-2 text-center">Stay Updated</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Get insights on AI, web development, and data science.
                </p>
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
