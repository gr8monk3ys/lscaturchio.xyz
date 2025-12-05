"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Code2, Database, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Brain,
    title: "AI & RAG Systems",
    description:
      "Build intelligent applications with retrieval-augmented generation, custom chatbots, and AI-powered search that actually understands your content.",
    examples: ["AI Chat Interfaces", "Document Q&A Systems", "Semantic Search"],
    href: "/services",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Database,
    title: "Data Science Solutions",
    description:
      "Transform raw data into actionable insights. From exploratory analysis to production ML models, I help you make sense of your data.",
    examples: ["Predictive Analytics", "Data Pipelines", "Visualization Dashboards"],
    href: "/services",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Code2,
    title: "Full-Stack Development",
    description:
      "Modern web applications built with React, Next.js, and TypeScript. Fast, accessible, and designed to scale with your needs.",
    examples: ["Web Applications", "API Development", "Database Design"],
    href: "/services",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Lightbulb,
    title: "Technical Consulting",
    description:
      "Not sure where to start? I can help you evaluate options, plan your architecture, and make informed technical decisions.",
    examples: ["Architecture Reviews", "Tech Stack Selection", "AI Strategy"],
    href: "/contact",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 px-4 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            What I Do
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            How I Can Help You
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you need an AI-powered application, data insights, or a complete web solution,
            I bring technical expertise combined with a focus on real business outcomes.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="group relative bg-background rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary/20"
            >
              <div className={`inline-flex p-3 rounded-xl ${service.bgColor} mb-6`}>
                <service.icon className={`w-6 h-6 ${service.color}`} />
              </div>

              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>

              <p className="text-muted-foreground mb-4 leading-relaxed">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {service.examples.map((example) => (
                  <span
                    key={example}
                    className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground"
                  >
                    {example}
                  </span>
                ))}
              </div>

              <Link
                href={service.href}
                className="inline-flex items-center text-sm font-medium text-primary group-hover:underline"
              >
                Learn more
                <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Have a specific project in mind?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Start a Conversation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
