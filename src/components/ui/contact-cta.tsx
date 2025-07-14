"use client";

import { motion } from "framer-motion";
import { Button } from "./button";
import { ArrowRight, Mail, Github, Linkedin } from "lucide-react";
import Link from "next/link";

export function ContactCTA() {
  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24 bg-stone-100/50 dark:bg-stone-800/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),inset_0_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_-1px_2px_rgba(255,255,255,0.05)]">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center gap-8"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space-mono font-bold tracking-tighter max-w-3xl">
            Let&apos;s Create Something{" "}
            <span className="text-primary">Amazing</span> Together
          </h2>
          <p className="text-lg md:text-xl font-space-mono text-muted-foreground max-w-2xl">
            Whether you have a project in mind or just want to chat, I&apos;m always
            open to discussing new opportunities and ideas.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="text-lg h-12 neu-button font-space-mono bg-stone-50 dark:bg-stone-800 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] transform transition-all">
                <Link href="https://calendly.com/gr8monk3ys/30min">
                  <Mail className="mr-2 h-5 w-5" />
                  Let&apos;s Chat
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg h-12 font-space-mono bg-stone-50 dark:bg-stone-800 border-none shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] transform transition-all"
              >
                <Link href="/services">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="flex gap-4 mt-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://github.com/gr8monk3ys"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-stone-50 dark:bg-stone-800 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] transition-all"
              >
                <Github className="h-6 w-6" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://linkedin.com/in/lorenzo-scaturchio"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-stone-50 dark:bg-stone-800 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] transition-all"
              >
                <Linkedin className="h-6 w-6" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
