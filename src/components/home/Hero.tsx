"use client";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Github, Linkedin, Twitter, Mail } from "lucide-react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { motion } from "framer-motion";
import { ThreeBackground } from "@/components/three";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
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
      ease: "easeOut",
    },
  },
};

const photoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const socialLinks = [
  { icon: Github, href: "https://github.com/gr8monk3ys", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/lscaturchio", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com/lscaturchio", label: "Twitter" },
  { icon: Mail, href: "mailto:lorenzo@lscaturchio.xyz", label: "Email" },
];

export function Hero() {
  return (
    <Container>
      <section className="relative min-h-[70vh] w-full px-4 md:px-6 py-8 flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <ThreeBackground type="particles" />

        <motion.div
          className="w-full max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Hero Content */}
          <div className="flex flex-col items-center text-center gap-8">
            {/* Photo with animated ring */}
            <motion.div
              className="relative"
              variants={photoVariants}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary/50 blur-xl opacity-50 animate-pulse" />
              <motion.div
                className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden ring-4 ring-primary/20"
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
            </motion.div>

            {/* Greeting Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Available for new projects
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Hi, I&apos;m{" "}
                <span className="text-primary">
                  Lorenzo Scaturchio
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                I help companies build{" "}
                <span className="text-foreground font-semibold">intelligent applications</span>{" "}
                with AI & data science. I write about machine learning, web development,
                and the intersection of technology with everyday life.
              </p>
            </motion.div>

            {/* Secondary Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Currently focused on building RAG systems, contributing to open source,
              and exploring how AI can make complex tools more accessible to everyone.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild size="lg" className="text-base h-12 px-8 rounded-full">
                  <Link href="/projects">
                    See My Work
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild size="lg" variant="outline" className="text-base h-12 px-8 rounded-full">
                  <Link href="/blog">
                    Read My Blog
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild size="lg" variant="ghost" className="text-base h-12 px-8 rounded-full">
                  <Link href="https://calendly.com/gr8monk3ys/30min" target="_blank" rel="noopener noreferrer">
                    Let&apos;s Talk
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 pt-6"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 1 + index * 0.1 }
                  }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>
    </Container>
  );
}
