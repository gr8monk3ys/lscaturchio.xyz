"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code, Brain, Server } from "lucide-react";
import { HoverCard } from "@/components/ui/animated-card";
import { staggerContainer, staggerItem } from "@/lib/animations";

const workItems = [
  {
    icon: Brain,
    title: "Building RAG Systems",
    description:
      "Exploring different use cases for retrieval-augmented generation systems and making them more marketable (basically trying to get paid for doing cool stuff).",
    linkText: "Read my thoughts",
    linkHref: "/blog",
  },
  {
    icon: Code,
    title: "Open-Source Contribution",
    description:
      "Navigating different types of project ideas and continually pushing for open-source contribution. Making data science problems more user-friendly.",
    linkText: "See my projects",
    linkHref: "/projects",
  },
  {
    icon: Server,
    title: "Community Impact",
    description:
      "Actively looking to better others around me, be it volunteer work like a tool loaning workshop or helping people learn to code.",
    linkText: "Learn more about me",
    linkHref: "/about",
  },
];

export function WorkingOnSection() {
  return (
    <section className="my-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold text-center mb-4">
          What I&apos;m Currently Working On
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          A few things keeping me busy these days
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
      >
        {workItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.title} variants={staggerItem}>
              <HoverCard className="neu-card p-6 h-full">
                <div className="neu-flat-sm rounded-xl p-3 w-fit mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <Link
                  href={item.linkHref}
                  className="text-primary hover:underline flex items-center group"
                >
                  {item.linkText}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </HoverCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
