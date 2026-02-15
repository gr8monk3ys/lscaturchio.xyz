"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceContent {
  title: string;
  subtitle: string;
  tabs: {
    name: string;
    content: string;
    features: string[];
  }[];
}

const services: ServiceContent[] = [
  {
    title: "AI Agents & Automation",
    subtitle: "Custom AI agents that actually work for your specific use case",
    tabs: [
      {
        name: "What I Build",
        content: "I build AI agents that handle real tasks - from research assistants that dig through documents to workflow automations that save hours of manual work. Each agent is designed around your actual needs, not generic templates.",
        features: [
          "LangChain & CrewAI implementations",
          "RAG systems with your data",
          "Tool-using agents",
          "Multi-agent workflows"
        ]
      },
      {
        name: "How It Works",
        content: "We start with a conversation about what you're trying to accomplish. Then I prototype quickly, iterate based on your feedback, and deliver something production-ready. No 50-page proposals - just working software.",
        features: [
          "Rapid prototyping",
          "Weekly progress updates",
          "Your feedback shapes direction",
          "Production deployment support"
        ]
      },
      {
        name: "Use Cases",
        content: "I've built agents for document analysis, customer support automation, research workflows, content generation, and data processing pipelines. If there's a repetitive task eating up your team's time, there's probably an agent for it.",
        features: [
          "Document Q&A systems",
          "Support ticket routing",
          "Research automation",
          "Content pipelines"
        ]
      },
      {
        name: "Getting Started",
        content: "Book a free 30-minute call and tell me what you're working on. I'll give you honest feedback on whether AI is the right solution and what it would take to build. No sales pitch, just straight talk.",
        features: [
          "Free initial consultation",
          "Honest feasibility assessment",
          "Clear scope and timeline",
          "Transparent pricing"
        ]
      },
    ],
  },
  {
    title: "RAG & Search Systems",
    subtitle: "Make your data actually searchable and useful",
    tabs: [
      {
        name: "What I Build",
        content: "Retrieval-Augmented Generation systems that let you chat with your documents, search through knowledge bases, and get accurate answers grounded in your actual data. No hallucinations, just facts from your sources.",
        features: [
          "Vector database setup",
          "Embedding optimization",
          "Hybrid search strategies",
          "Citation & source tracking"
        ]
      },
      {
        name: "Tech Stack",
        content: "I work with Neon pgvector, Pinecone, Weaviate, and Chroma depending on your needs and scale. OpenAI, Anthropic, or open-source models for embeddings and generation. Whatever fits your requirements and budget.",
        features: [
          "Neon pgvector / Pinecone / Weaviate",
          "OpenAI / Claude / Open-source",
          "Next.js / Python backends",
          "Vercel / AWS deployment"
        ]
      },
      {
        name: "Common Projects",
        content: "Internal knowledge bases for teams, customer-facing documentation search, research paper analysis tools, legal document review systems, and support chatbots that actually know your product.",
        features: [
          "Internal knowledge search",
          "Documentation chatbots",
          "Research tools",
          "Support automation"
        ]
      },
      {
        name: "Results",
        content: "My clients typically see 60-80% reduction in time spent searching for information, higher accuracy than keyword search, and actually useful AI chat interfaces that people want to use.",
        features: [
          "Faster information retrieval",
          "Higher search accuracy",
          "Reduced support tickets",
          "Better user experience"
        ]
      },
    ],
  },
  {
    title: "Technical Consulting",
    subtitle: "Get unstuck on AI/ML projects with hands-on help",
    tabs: [
      {
        name: "How I Help",
        content: "Sometimes you don't need someone to build the whole thing - you just need expertise to unblock your team. I do code reviews, architecture sessions, pair programming, and strategic planning for AI projects.",
        features: [
          "Architecture review",
          "Code review & optimization",
          "Team training sessions",
          "Technical strategy"
        ]
      },
      {
        name: "Common Asks",
        content: "\"Our RAG system is returning garbage\" - \"We need to add AI features but don't know where to start\" - \"Our LLM costs are out of control\" - \"Should we fine-tune or use prompting?\" I've helped teams work through all of these.",
        features: [
          "Debugging AI systems",
          "Cost optimization",
          "Model selection guidance",
          "Prompt engineering"
        ]
      },
      {
        name: "Engagement Types",
        content: "One-time deep dives, weekly office hours, or embedded support with your team. Flexible arrangements based on what you actually need. Remote-friendly, async-friendly.",
        features: [
          "One-time consultations",
          "Weekly advisory calls",
          "Embedded team support",
          "Async code review"
        ]
      },
      {
        name: "Background",
        content: "I've been building with LLMs since GPT-3, worked on production RAG systems, and keep up with the latest research. Not a generalist who read a blog post - someone who's shipped real AI products.",
        features: [
          "Production experience",
          "Current research knowledge",
          "Practical implementation focus",
          "No-BS communication"
        ]
      },
    ],
  },
];

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-16 px-4 md:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-16"
      >
        {/* Service Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedService(index);
                setSelectedTab(0);
              }}
              className={cn(
                "group cursor-pointer rounded-xl p-8 transition-all",
                selectedService === index
                  ? "neu-pressed bg-primary/5"
                  : "neu-card"
              )}
            >
              <div className="flex flex-col h-full">
                <h3 className={cn(
                  "text-xl font-semibold mb-3",
                  selectedService === index && "text-primary"
                )}>{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.subtitle}</p>
                <div className="mt-auto flex items-center">
                  <ArrowUpRight className={cn(
                    "w-5 h-5 transition-transform text-primary",
                    selectedService === index ? "rotate-45" : "group-hover:rotate-45"
                  )} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs and Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 justify-start">
            {services[selectedService].tabs.map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => setSelectedTab(index)}
                className={cn(
                  "px-5 py-2.5 rounded-xl transition-all text-sm font-medium",
                  selectedTab === index
                    ? "neu-pressed text-primary"
                    : "neu-button hover:text-primary"
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <motion.div
            key={`${selectedService}-${selectedTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="neu-card rounded-xl p-8"
          >
            <div className="max-w-3xl">
              <p className="text-lg leading-relaxed mb-6">
                {services[selectedService].tabs[selectedTab].content}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services[selectedService].tabs[selectedTab].features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
