"use client";

import { Container } from "@/components/Container";
import { motion, useScroll, useTransform } from "framer-motion";
import { Hero } from "@/components/home/Hero";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
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
        name="Lorenzo Scaturchio | Data Scientist, Developer & Digital Craftsman"
        description="Explore Lorenzo Scaturchio's portfolio featuring innovative data science projects, web development solutions, and creative digital experiences. Specializing in machine learning, data analysis, and responsive web applications."
        siteType="Portfolio"
      />
      <PersonStructuredData
        name="Lorenzo Scaturchio"
        description="Data Scientist and Developer specializing in machine learning, data analysis, and web development"
        image="https://lscaturchio.xyz/images/portrait.jpg"
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
          <h2 className="text-3xl font-bold text-center mb-8">My Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <Database className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Data Science</h3>
              <p className="text-muted-foreground mb-4">Transforming raw data into actionable insights through advanced analytics, statistical modeling, and machine learning techniques.</p>
              <Link href="/services" className="text-primary hover:underline flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <Code className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Web Development</h3>
              <p className="text-muted-foreground mb-4">Building responsive, performant web applications with modern technologies that provide seamless user experiences across devices.</p>
              <Link href="/projects" className="text-primary hover:underline flex items-center">
                See projects <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <Brain className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Integration</h3>
              <p className="text-muted-foreground mb-4">Implementing artificial intelligence solutions that enhance products and services through automation, prediction, and personalization.</p>
              <Link href="/blog" className="text-primary hover:underline flex items-center">
                Read articles <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        
        <RecentBlogs />
        <RecentProjects />
      </Container>
    </main>
  );
}
