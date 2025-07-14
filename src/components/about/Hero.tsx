"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/section-heading";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function AboutHero() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center"
    >
      <motion.div
        variants={itemVariants}
        className="space-y-6"
      >
        <SectionHeading>
          Hi, I&apos;m Lorenzo. I build things for the web and beyond.
        </SectionHeading>
        <motion.p
          variants={itemVariants}
          className="text-lg"
        >
          I&apos;m a software engineer and machine learning enthusiast based in California. 
          With a passion for building innovative solutions, I specialize in full-stack 
          development and artificial intelligence applications.
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="text-lg"
        >
          When I&apos;m not coding, you&apos;ll find me rock climbing, producing electronic music, 
          or exploring new coffee shops around the world. I believe in continuous learning 
          and pushing the boundaries of what&apos;s possible with technology.
        </motion.p>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="relative aspect-square"
      >
        <div className="relative h-full w-full overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-900/10 dark:ring-white/10">
          <Image
            src="/images/coachella.png"
            alt="Lorenzo Scaturchio at Coachella"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-all hover:scale-105 duration-500"
            priority
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
