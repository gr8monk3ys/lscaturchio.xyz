"use client";

import { Container } from "@/components/Container";
import { motion, useScroll, useTransform } from "framer-motion";
import { Hero } from "@/components/home/Hero";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
import { NewsletterSection } from "@/components/newsletter/newsletter-section";
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
            <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <Brain className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Building RAG Systems</h3>
              <p className="text-muted-foreground mb-4">Exploring different use cases for retrieval-augmented generation systems and making them more marketable (basically trying to get paid for doing cool stuff).</p>
              <Link href="/blog" className="text-primary hover:underline flex items-center">
                Read my thoughts <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <Code className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Open-Source Contribution</h3>
              <p className="text-muted-foreground mb-4">Navigating different types of project ideas and continually pushing for open-source contribution. Making data science problems more user-friendly.</p>
              <Link href="/projects" className="text-primary hover:underline flex items-center">
                See my projects <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <Server className="h-10 w-10 text-primary mb-4" />
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

      <NewsletterSection />

      <Container size="large">
        <section className="my-16 px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to collaborate?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            I&apos;m always interested in new projects and opportunities. Whether you need data analysis, a web application, 
            or want to discuss potential collaborations, I&apos;d love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:opacity-90 transition-opacity">
              Get in touch
            </Link>
            <Link href="/about" className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md hover:opacity-90 transition-opacity">
              Learn more about me
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
