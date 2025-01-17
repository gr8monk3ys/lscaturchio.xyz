"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SectionHeading } from "./ui/section-heading";
import { Interests } from "./ui/interests";

export default function About() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeading>
            Hi, I&apos;m Lorenzo. I build things for the web and beyond.
          </SectionHeading>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base text-zinc-600 dark:text-zinc-400"
          >
            I&apos;m a software engineer and machine learning enthusiast based in California. 
            With a passion for building innovative solutions, I specialize in full-stack 
            development and artificial intelligence applications.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-base text-zinc-600 dark:text-zinc-400"
          >
            When I&apos;m not coding, you&apos;ll find me rock climbing, producing electronic music, 
            or exploring new coffee shops around the world. I believe in continuous learning 
            and pushing the boundaries of what&apos;s possible with technology.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800"
        >
          <Image
            src="/images/coachella.png"
            alt="Lorenzo Scaturchio at Coachella"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/10 dark:ring-white/10" />
        </motion.div>
      </div>

      {/* Journey Section */}
      <div>
        <SectionHeading>My Journey</SectionHeading>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-2xl text-base text-zinc-600 dark:text-zinc-400"
        >
          <p className="mb-4">
            My journey in tech began with a fascination for problem-solving and a desire 
            to create meaningful impact. Through my work in software development and machine 
            learning, I&apos;ve had the opportunity to work on diverse projects that challenge 
            conventional thinking and push technological boundaries.
          </p>
          <p>
            I&apos;m particularly passionate about the intersection of artificial intelligence 
            and human-centered design. My goal is to build technology that not only solves 
            complex problems but also enhances human capabilities and creates positive change.
          </p>
        </motion.div>
      </div>

      {/* <TechStack /> */}
      <Interests />
    </div>
  );
}
