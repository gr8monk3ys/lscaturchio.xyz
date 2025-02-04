"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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

export function AboutJourney() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <SectionHeading>My Journey</SectionHeading>
      <motion.div
        variants={itemVariants}
        className="space-y-4 text-lg max-w-3xl"
      >
        <motion.p variants={itemVariants}>
          My journey in tech began with a fascination for problem-solving and a desire 
          to create meaningful impact. Through my work in software development and machine 
          learning, I&apos;ve had the opportunity to work on diverse projects that challenge 
          conventional thinking and push technological boundaries.
        </motion.p>
        <motion.p variants={itemVariants}>
          I&apos;m particularly passionate about the intersection of artificial intelligence 
          and human-centered design. My goal is to build technology that not only solves 
          complex problems but also enhances human capabilities and creates positive change.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
