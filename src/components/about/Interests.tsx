"use client";

import { m, useInView } from '@/lib/motion';
import { useRef } from "react";

const interests = [
  {
    title: "Chess",
    description: "Strategic thinking and pattern recognition over the board",
    tags: ["Strategy", "Tactics"]
  },
  {
    title: "Film",
    description: "Appreciating cinematography, storytelling, and visual art",
    tags: ["Cinema", "Storytelling"]
  },
  {
    title: "Running",
    description: "Pushing physical and mental boundaries",
    tags: ["Sport", "10k"]
  },
  {
    title: "Music Production",
    description: "Creating and mixing indie & electronic music",
    tags: ["Electronic", "Production"]
  },
  {
    title: "Travel",
    description: "Exploring new cultures and perspectives",
    tags: ["Adventure", "Culture"]
  },
  {
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

  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24">
      <div className="w-full max-w-7xl mx-auto" ref={containerRef}>
        <m.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="flex flex-col gap-10"
        >
          <m.div variants={itemVariants} className="flex gap-4 flex-col items-start">
            <span className="label-mono block">What I Love</span>
            <div className="flex gap-2 flex-col">
              <h2 className="font-display text-3xl md:text-5xl tracking-tight font-bold">
                Interests & Hobbies
              </h2>
              <p className="text-lg max-w-prose">
                A glimpse into what keeps me curious and motivated beyond the code.
              </p>
            </div>
          </m.div>

          <div className="grid grid-cols-1 divide-border border-y border-border sm:grid-cols-2 sm:divide-x lg:grid-cols-3">
            {interests.map((interest) => (
              <m.div
                key={interest.title}
                variants={itemVariants}
                className="px-5 py-8"
              >
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {interest.title}
                </h3>
                <p className="mt-2 text-lg text-muted-foreground">
                  {interest.description}
                </p>
                <p className="label-mono mt-4">
                  {interest.tags.join("  ·  ")}
                </p>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
