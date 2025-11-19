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
              className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden"
              variants={photoVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              }}
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
                Data Scientist from Southern California. Building RAG systems, contributing to open source,
                and making data science more accessible. Also: bagpipes, Arctic Monkeys, and Rust.
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
              <Button asChild size="lg" className="text-lg h-12">
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
              <Button asChild size="lg" variant="outline" className="text-lg h-12">
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
                className="flex items-center gap-2 text-muted-foreground"
                custom={index}
                variants={iconVariants}
                whileHover={{ 
                  scale: 1.1,
                  color: "var(--primary)",
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
