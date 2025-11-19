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
          I&apos;m Lorenzo Scaturchio, just another person with too many things to say and too little time to say it.
        </SectionHeading>
        <motion.p
          variants={itemVariants}
          className="text-lg"
        >
          Growing up in Southern California, I&apos;ve always been completely drawn into computers.
          My dad had Age of Empires II running in the background, and even at a really young age,
          I would try to play it. My story is one of many blessings - two loving parents still together,
          a balanced lifestyle where we truly prioritize time spent together as a family unit.
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="text-lg"
        >
          The usual exploration of self began in high school, delving into corners of the internet
          to learn outside of traditional education. Was most of it useless? Absolutely. But there
          are hidden gems that shaped my philosophy towards life. When I&apos;m not coding, you&apos;ll
          find me rock climbing, running, surfing, or producing indie/folk music with industrial textures.
        </motion.p>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="relative aspect-square"
      >
        <div className="relative h-full w-full overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-900/10 dark:ring-white/10">
          <Image
            src="/images/coachella.webp"
            alt="Lorenzo Scaturchio at Coachella"
            fill
            className="object-cover transition-all hover:scale-105 duration-500"
            priority
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
