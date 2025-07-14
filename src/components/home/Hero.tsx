"use client";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Music, Mountain } from "lucide-react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { motion } from "framer-motion";

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

const photoVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const iconVariants = {
  hidden: { scale: 0 },
  visible: (i: number) => ({
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 1 + (i * 0.1),
    },
  }),
};

export function Hero() {
  return (
    <Container>
      <section className="min-h-[80vh] w-full px-4 md:px-6 py-8 flex items-center justify-center">
        <motion.div 
          className="w-full max-w-7xl mx-auto space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <motion.div 
              className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(255,255,255,0.05)] p-1 bg-stone-50 dark:bg-stone-800"
              variants={photoVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <OptimizedImage
                src="/images/portrait.jpg"
                alt="Lorenzo Scaturchio"
                fill
                priority
                className="rounded-full object-cover"
              />
            </motion.div>
            <div className="text-center md:text-left space-y-4 max-w-2xl">
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                variants={itemVariants}
              >
                Hey, I&apos;m{" "}
                <span className="text-primary">Lorenzo Scaturchio</span>
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground"
                variants={itemVariants}
              >
                Data Scientist, Musician, and Outdoor Enthusiast crafting digital experiences
                that make a difference.
              </motion.p>
            </div>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="origin-center"
            >
              <Button asChild size="lg" className="neu-button text-lg h-12 shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.6)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.2),-3px_-3px_6px_rgba(255,255,255,0.04)]" variant="default">
                <Link href="/projects">
                  View My Work
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="origin-center"
            >
              <Button asChild size="lg" variant="outline" className="neu-button text-lg h-12 shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.6)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.2),-3px_-3px_6px_rgba(255,255,255,0.04)]">
                <Link href="https://calendly.com/gr8monk3ys/30min">
                  Let&apos;s Chat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 pt-4"
          >
            {[
              { icon: Code, text: "Data Science" },
              { icon: Music, text: "Music" },
              { icon: Mountain, text: "Outdoors" }
            ].map((item, index) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2 text-muted-foreground px-4 py-2 rounded-md bg-stone-100 dark:bg-stone-800 shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.6)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.2),-3px_-3px_6px_rgba(255,255,255,0.04)]"
                custom={index}
                variants={iconVariants}
                whileHover={{ 
                  scale: 1.05,
                  color: "var(--primary)",
                  shadow: "[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.6)]",
                  transition: { type: "spring", stiffness: 400 }
                }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </Container>
  );
}
