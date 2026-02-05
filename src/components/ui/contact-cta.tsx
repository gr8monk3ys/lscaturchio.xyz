"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Github, Linkedin } from "lucide-react";
import Link from "next/link";

export function ContactCTA() {
  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24">
      <div className="w-full max-w-4xl mx-auto neu-card p-10 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center gap-8"
        >
          <h2 className="text-display max-w-3xl">
            Let&apos;s Create Something{" "}
            <span className="text-primary">Amazing</span> Together
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl">
            Whether you have a project in mind or just want to chat, I&apos;m always
            open to discussing new opportunities and ideas.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="https://calendly.com/gr8monk3ys/30min"
                className="cta-primary px-8 py-4 rounded-xl text-lg inline-flex items-center gap-3"
              >
                <Mail className="h-5 w-5" />
                Let&apos;s Chat
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/services"
                className="cta-secondary px-8 py-4 rounded-xl text-lg inline-flex items-center gap-3"
              >
                Learn More
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>

          <div className="flex gap-6 mt-6">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://github.com/gr8monk3ys"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl neu-button hover:text-primary transition-all"
              >
                <Github className="h-6 w-6" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://linkedin.com/in/lorenzo-scaturchio"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl neu-button hover:text-primary transition-all"
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
