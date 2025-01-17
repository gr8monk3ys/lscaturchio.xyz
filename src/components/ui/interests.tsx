"use client";

import { motion } from "framer-motion";
import { Code, Music, Mountain, Brain, Coffee, Plane } from "lucide-react";

const interests = [
  {
    icon: Code,
    title: "Software Development",
    description: "Building elegant solutions to complex problems",
  },
  {
    icon: Brain,
    title: "Machine Learning",
    description: "Exploring the frontiers of AI and neural networks",
  },
  {
    icon: Mountain,
    title: "Rock Climbing",
    description: "Pushing physical and mental boundaries",
  },
  {
    icon: Music,
    title: "Music Production",
    description: "Creating and mixing electronic music",
  },
  {
    icon: Plane,
    title: "Travel",
    description: "Exploring new cultures and perspectives",
  },
  {
    icon: Coffee,
    title: "Coffee",
    description: "Discovering unique roasts and brewing methods",
  },
];

export function Interests() {
  return (
    <div className="mt-16">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-zinc-800 dark:text-zinc-100"
      >
        Interests & Hobbies
      </motion.h3>
      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map((interest, index) => (
          <motion.div
            key={interest.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="group relative overflow-hidden rounded-2xl bg-zinc-50 p-6 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/50"
          >
            <div className="relative z-10">
              <interest.icon className="h-8 w-8 text-primary" />
              <h4 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {interest.title}
              </h4>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {interest.description}
              </p>
            </div>
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
