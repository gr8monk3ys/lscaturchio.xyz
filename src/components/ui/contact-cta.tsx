"use client";

import { motion } from '@/lib/motion';
import { ArrowRight, Mail, Github, Linkedin } from "lucide-react";
import Link from "next/link";

export function ContactCTA() {
  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-20">
      <div className="w-full max-w-5xl mx-auto neu-card p-8 lg:p-12">
        {/* Keep this CTA visible during SSR; avoid "hidden until hydration" issues. */}
        <div className="flex flex-col items-center text-center gap-7">
          <h2 className="text-display max-w-3xl text-balance">
            Let&apos;s Create Something{" "}
            <span className="text-primary">Amazing</span> Together
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl text-balance">
            Whether you have a project in mind or just want to chat, I&apos;m always
            open to discussing new opportunities and ideas.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="https://calendly.com/gr8monk3ys/30min"
                className="cta-primary h-11 px-6 rounded-xl text-base inline-flex items-center gap-2.5"
              >
                <Mail className="h-4 w-4" />
                Let&apos;s Chat
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/services"
                className="cta-secondary h-11 px-6 rounded-xl text-base inline-flex items-center gap-2.5"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://github.com/gr8monk3ys"
                target="_blank"
                rel="noopener noreferrer"
                className="neu-button inline-flex items-center gap-2 rounded-xl px-4 py-2 hover:text-primary transition-all"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://linkedin.com/in/lorenzo-scaturchio"
                target="_blank"
                rel="noopener noreferrer"
                className="neu-button inline-flex items-center gap-2 rounded-xl px-4 py-2 hover:text-primary transition-all"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
