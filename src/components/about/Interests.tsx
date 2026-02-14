"use client";

import { motion, useInView } from "framer-motion";
import { Crown, Music, Mountain, Film, Coffee, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";

const interests = [
  {
    icon: Crown,
    title: "Chess",
    description: "Strategic thinking and pattern recognition over the board",
    tags: ["Strategy", "Tactics"]
  },
  {
    icon: Film,
    title: "Film",
    description: "Appreciating cinematography, storytelling, and visual art",
    tags: ["Cinema", "Storytelling"]
  },
  {
    icon: Mountain,
    title: "Running",
    description: "Pushing physical and mental boundaries",
    tags: ["Sport", "10k"]
  },
  {
    icon: Music,
    title: "Music Production",
    description: "Creating and mixing indie & electronic music",
    tags: ["Electronic", "Production"]
  },
  {
    icon: Plane,
    title: "Travel",
    description: "Exploring new cultures and perspectives",
    tags: ["Adventure", "Culture"]
  },
  {
    icon: Coffee,
    title: "Coffee",
    description: "Discovering unique roasts and brewing methods",
    tags: ["Brewing", "Roasting"]
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
        type: "spring" as const,
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
        type: "spring" as const,
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
        type: "spring" as const,
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
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold">
                Interests & Hobbies
              </h2>
              <p className="text-lg max-w-prose">
                A glimpse into what keeps me curious and motivated beyond the code.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interests.map((interest) => (
              <motion.div
                key={interest.title}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring" as const, stiffness: 300 }
                }}
                className="group relative flex flex-col gap-4"
              >
                <div className="neu-card rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-4">
                      <motion.div
                        variants={iconVariants}
                        className="neu-flat-sm shrink-0 size-12 flex items-center justify-center rounded-xl text-primary"
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
