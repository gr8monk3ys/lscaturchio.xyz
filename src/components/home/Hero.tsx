"use client";

import { useRef } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Music, Mountain } from "lucide-react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { motion } from "framer-motion";
import { CursorGlow } from "@/components/ui/cursor-glow";
import {
  staggerContainerVariants,
  staggerItemVariants,
  photoReveal,
  iconPop
} from "@/lib/animations";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <Section padding="large" size="wide">
      <section
        ref={sectionRef}
        className="relative min-h-[50vh] sm:min-h-[55vh] w-full flex items-center justify-center overflow-hidden"
      >
        {/* Cursor glow effect */}
        <CursorGlow
          containerRef={sectionRef}
          size={600}
          opacity={0.12}
          color="hsl(var(--primary))"
          zIndex={1}
        />

        <motion.div
          className="w-full max-w-6xl mx-auto space-y-6"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <motion.div
              className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full overflow-hidden"
              variants={photoReveal}
            >
              <OptimizedImage
                src="/images/portrait.webp"
                alt="Lorenzo Scaturchio"
                fill
                priority
                className="rounded-full object-cover"
              />
            </motion.div>
            <div className="text-center md:text-left space-y-4 max-w-2xl">
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                variants={staggerItemVariants}
              >
                Hey, I&apos;m{" "}
                <span className="text-primary">Lorenzo Scaturchio</span>
              </motion.h2>
              <motion.p
                className="text-lg sm:text-xl text-muted-foreground"
                variants={staggerItemVariants}
              >
                Data Scientist from Southern California. Building RAG systems, contributing to open source,
                and making data science more accessible.
              </motion.p>
            </div>
          </div>

          <motion.div
            variants={staggerItemVariants}
            className="flex flex-wrap justify-center gap-3 sm:gap-4"
          >
            <Button asChild size="lg" className="text-base sm:text-lg h-11 sm:h-12">
              <Link href="/projects">
                View My Work
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base sm:text-lg h-11 sm:h-12">
              <Link href="https://calendly.com/gr8monk3ys/30min">
                Let&apos;s Chat
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            variants={staggerItemVariants}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-2"
          >
            {[
              { icon: Code, text: "Data Science" },
              { icon: Music, text: "Music" },
              { icon: Mountain, text: "Outdoors" }
            ].map((item, index) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                custom={index}
                variants={iconPop}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </Section>
  );
}
