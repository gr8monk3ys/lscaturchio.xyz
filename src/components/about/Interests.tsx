"use client";

import { motion, useInView } from "framer-motion";
import { Code, Music, Mountain, Brain, Coffee, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";

const interests = [
  {
    icon: Code,
    title: "Systems Architecture",
    description: "Designing resilient distributed systems with an emphasis on functional paradigms",
    tags: ["Distributed Systems", "Functional Programming"]
  },
  {
    icon: Brain,
    title: "Computational Linguistics",
    description: "Exploring the intersection of language processing and cognitive modeling",
    tags: ["NLP", "Semantic Analysis"]
  },
  {
    icon: Mountain,
    title: "Ultra Endurance",
    description: "Embracing the meditative flow state of sustained physical exertion",
    tags: ["Trail Running", "Mental Fortitude"]
  },
  {
    icon: Music,
    title: "Ambient Composition",
    description: "Creating textural soundscapes that blend analog warmth with digital precision",
    tags: ["Modular Synthesis", "Field Recording"]
  },
  {
    icon: Plane,
    title: "Cultural Immersion",
    description: "Engaging with communities to understand nuanced social contexts and perspectives",
    tags: ["Anthropology", "Local Cuisine"]
  },
  {
    icon: Coffee,
    title: "Coffee Cultivation",
    description: "Exploring the relationship between terroir, processing methods, and flavor profiles",
    tags: ["Single Origin", "Fermentation"]
  },
];

export function Interests() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -45 },
    show: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const tagVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15
      }
    }
  };

  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24">
      <div className="w-full max-w-7xl mx-auto" ref={containerRef}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="flex flex-col gap-10"
        >
          <motion.div variants={itemVariants} className="flex gap-4 flex-col items-start">
            <Badge variant="secondary">What I Love</Badge>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold text-stone-600">
                Interests & Hobbies
              </h2>
              <p className="text-lg max-w-prose">
                A glimpse into what keeps me curious and motivated beyond the code.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interests.map((interest, index) => (
              <motion.div
                key={interest.title}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group relative flex flex-col gap-4"
              >
                <div className="block bg-stone-50 dark:bg-stone-800 rounded-xl p-6 shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-2px_-2px_5px_rgba(255,255,255,0.04)] group-hover:shadow-[2px_2px_4px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)] dark:group-hover:shadow-[2px_2px_4px_rgba(0,0,0,0.4),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:translate-y-[-3px] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-4">
                      <motion.div 
                        variants={iconVariants}
                        className="shrink-0 size-12 flex items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shadow-[2px_2px_3px_rgba(0,0,0,0.05),-2px_-2px_3px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_3px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.03)] transition-all group-hover:shadow-[1px_1px_2px_rgba(0,0,0,0.08),-1px_-1px_2px_rgba(255,255,255,0.8)] dark:group-hover:shadow-[1px_1px_2px_rgba(0,0,0,0.3),-0.5px_-0.5px_1px_rgba(255,255,255,0.05)]"
                      >
                        <interest.icon className="size-6" />
                      </motion.div>
                      <motion.h3 
                        variants={itemVariants}
                        className="text-xl font-semibold tracking-tight"
                      >
                        {interest.title}
                      </motion.h3>
                      <motion.p 
                        variants={itemVariants}
                        className="text-lg"
                      >
                        {interest.description}
                      </motion.p>
                    </div>
                  </div>
                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap gap-2 mt-4"
                  >
                    {interest.tags.map((tag) => (
                      <motion.div
                        key={tag}
                        variants={tagVariants}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
