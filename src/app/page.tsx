"use client";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Music, Mountain } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Feature } from "@/components/ui/feature-section-with-bento-grid";
import { RecentBlogs } from "@/components/ui/recent-blogs";
import { SkillsShowcase } from "@/components/ui/skills-showcase";
import { motion, useScroll, useTransform } from "framer-motion";
import { ContactCTA } from "@/components/ui/contact-cta";

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="relative z-10">
          <Container>
            <section className="min-h-[calc(100vh-4rem)] w-full px-4 md:px-6 py-12 flex items-center justify-center">
              <motion.div 
                className="w-full max-w-7xl mx-auto space-y-8"
                style={{ y, opacity }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <motion.div 
                      className="relative w-48 h-48 md:w-56 md:h-56"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Image
                        src="/images/portrait.jpg"
                        alt="Lorenzo Scaturchio"
                        fill
                        priority
                        className="object-cover rounded-full border-4 border-background shadow-xl"
                      />
                    </motion.div>
                    <div className="text-center md:text-left space-y-4 max-w-2xl">
                      <motion.h1 
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        Hey, I&apos;m{" "}
                        <span className="text-primary">Lorenzo Scaturchio</span>
                      </motion.h1>
                      <motion.p 
                        className="text-xl md:text-2xl text-muted-foreground"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        Data Scientist, Musician, and Outdoor Enthusiast crafting digital experiences
                        that make a difference.
                      </motion.p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild size="lg" className="text-lg h-12">
                      <Link href="/projects">
                        View My Work
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild size="lg" variant="outline" className="text-lg h-12">
                      <Link href="https://calendly.com/gr8monk3ys/30min">
                          Let&apos;s Chat
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex flex-wrap justify-center gap-6 pt-8"
                >
                  {[
                    { icon: Code, text: "Data Science" },
                    { icon: Music, text: "Music" },
                    { icon: Mountain, text: "Outdoors" }
                  ].map((item, index) => (
                    <motion.div
                      key={item.text}
                      className="flex items-center gap-2 text-muted-foreground"
                      whileHover={{ scale: 1.1, color: "var(--primary)" }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </section>
          </Container>
        </div>
      <Container size="large">
        <Feature />
        <SkillsShowcase />
        <RecentBlogs />
        {/* <Testimonials /> */}
        <ContactCTA />
      </Container>
    </main>
  );
}
