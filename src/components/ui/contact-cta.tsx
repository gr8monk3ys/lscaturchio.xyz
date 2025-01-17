"use client";

import { motion } from "framer-motion";
import { Button } from "./button";
import { ArrowRight, Mail, Github, Linkedin } from "lucide-react";
import Link from "next/link";

export function ContactCTA() {
  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24 bg-primary/5">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center gap-8"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter max-w-3xl">
            Let&apos;s Create Something{" "}
            <span className="text-primary">Amazing</span> Together
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Whether you have a project in mind or just want to chat, I&apos;m always
            open to discussing new opportunities and ideas.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="text-lg h-12">
                <Link href="mailto:your.email@example.com">
                  <Mail className="mr-2 h-5 w-5" />
                  Get in Touch
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg h-12"
              >
                <Link href="/contact">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="flex gap-4 mt-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-secondary/50 hover:bg-secondary/80 transition-colors"
              >
                <Github className="h-6 w-6" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-secondary/50 hover:bg-secondary/80 transition-colors"
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
