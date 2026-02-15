"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Code, Music, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { CursorGlow } from "@/components/ui/cursor-glow";
import { cn } from "@/lib/utils";

export function HeroScrollSignature() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const portraitX = useTransform(scrollYProgress, [0, 0.85], [0, -120]);
  const portraitScale = useTransform(scrollYProgress, [0, 0.85], [1, 0.84]);
  const portraitY = useTransform(scrollYProgress, [0, 0.85], [0, -8]);

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const headlineScale = useTransform(scrollYProgress, [0, 0.85], [1, 0.9]);

  const badgeOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const subOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.12]);
  const ctaOpacity = useTransform(scrollYProgress, [0.15, 0.35, 0.6], [0, 1, 1]);

  const chipsOpacity = useTransform(scrollYProgress, [0.25, 0.55], [0, 1]);
  const chipsY = useTransform(scrollYProgress, [0.25, 0.55], [18, 0]);

  const blob1X = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [30, -40]);

  if (reduceMotion) {
    return (
      <section className="relative min-h-[55vh] w-full flex items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute top-8 right-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-6 left-10 h-48 w-48 rounded-full bg-accent/35 blur-2xl" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-44 h-44 rounded-full overflow-hidden">
              <OptimizedImage
                src="/images/portrait.webp"
                alt="Lorenzo Scaturchio"
                fill
                priority
                className="rounded-full object-cover"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                Applied ML + RAG Systems
              </div>
              <h2 className="text-5xl font-bold tracking-tight">
                Hey, I&apos;m <span className="text-primary">Lorenzo Scaturchio</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                I build practical RAG and ML systems that ship cleanly, feel human, and stay reliable in production.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg" variant="primary" className="h-11 px-7">
                  <Link href="/projects">
                    View My Work
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="cta-secondary h-11 px-7">
                  <Link href="/contact">
                    Contact Me
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative h-[180vh] w-full overflow-hidden"
      aria-label="Intro"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-28 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl"
          style={{ x: blob1X }}
        />
        <motion.div
          className="absolute top-12 right-12 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"
          style={{ y: blob2Y }}
        />
        <div className="absolute bottom-8 left-12 h-56 w-56 rounded-full bg-accent/30 blur-2xl" />
      </div>

      <CursorGlow
        containerRef={containerRef}
        size={700}
        opacity={0.1}
        color="hsl(var(--primary))"
        zIndex={1}
      />

      <div className="sticky top-20 flex min-h-[calc(100vh-5rem)] items-center">
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 items-center gap-10">
            <motion.div
              className="col-span-5"
              style={{ x: portraitX, y: portraitY, scale: portraitScale, willChange: "transform" }}
            >
              <div className="relative w-60 h-60 rounded-full overflow-hidden border border-border/50 bg-background/40 shadow-sm">
                <OptimizedImage
                  src="/images/portrait.webp"
                  alt="Lorenzo Scaturchio"
                  fill
                  priority
                  className="rounded-full object-cover"
                />
              </div>
            </motion.div>

            <div className="col-span-7">
              <motion.div
                style={{ opacity: badgeOpacity }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary"
              >
                Applied ML + RAG Systems
              </motion.div>

              <motion.div
                style={{ y: headlineY, scale: headlineScale, transformOrigin: "left center", willChange: "transform" }}
                className="mt-6"
              >
                <h2 className="text-6xl font-bold tracking-tight leading-[0.98]">
                  Hey, I&apos;m{" "}
                  <span className="text-primary">Lorenzo Scaturchio</span>
                </h2>
              </motion.div>

              <motion.p
                style={{ opacity: subOpacity }}
                className="mt-5 text-lg text-muted-foreground max-w-2xl"
              >
                I build practical RAG and ML systems that ship cleanly, feel human, and stay reliable in production.
              </motion.p>

              <motion.div
                style={{ opacity: ctaOpacity }}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <Button asChild size="lg" variant="primary" className="text-base h-11 px-7">
                  <Link href="/projects">
                    View My Work
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="cta-secondary text-base h-11 px-7">
                  <Link href="/contact">
                    Contact Me
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                style={{ opacity: chipsOpacity, y: chipsY }}
                className="mt-8 flex flex-wrap items-center gap-4 text-muted-foreground"
              >
                {[
                  { icon: Code, text: "Data Science" },
                  { icon: Music, text: "Music" },
                  { icon: Mountain, text: "Outdoors" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border border-border/50",
                      "bg-background/60 px-4 py-2 text-sm backdrop-blur-sm"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-0 right-0 -bottom-10 flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="rounded-full border border-border/40 bg-background/60 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm"
            >
              Scroll to reveal more
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

