"use client";

import { m } from '@/lib/motion';
import Image from "next/image";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  staggerContainerVariants,
  staggerItemVariants
} from "@/lib/animations";

export function AboutHero() {
  return (
    <m.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center"
    >
      <m.div
        variants={staggerItemVariants}
        className="space-y-6"
      >
        <SectionHeading>
          I&apos;m Lorenzo Scaturchio, just another person with too many things to say and too little time to say it.
        </SectionHeading>
        <m.p
          variants={staggerItemVariants}
          className="text-lg"
        >
          Growing up in Southern California, I&apos;ve always been completely drawn into computers.
          My dad had Age of Empires II running in the background, and even at a really young age,
          I would try to play it. My story is one of many blessings - two loving parents still together,
          a balanced lifestyle where we truly prioritize time spent together as a family unit.
        </m.p>
        <m.p
          variants={staggerItemVariants}
          className="text-lg"
        >
          The usual exploration of self began in high school, delving into corners of the internet
          to learn outside of traditional education. Was most of it useless? Absolutely. But there
          are hidden gems that shaped my philosophy towards life. When I&apos;m not coding, you&apos;ll
          find me rock climbing, running, surfing, or producing indie/folk music with industrial textures.
        </m.p>
      </m.div>
      <m.div
        variants={staggerItemVariants}
        className="relative aspect-square"
      >
        <div className="relative h-full w-full overflow-hidden border border-border bg-muted">
          <Image
            src="/images/coachella.webp"
            alt="Lorenzo Scaturchio at Coachella"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-all hover:scale-105 duration-500"
            priority
          />
        </div>
      </m.div>
    </m.div>
  );
}
