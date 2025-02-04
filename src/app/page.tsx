"use client";

import { Container } from "@/components/Container";
import { RecentBlogs } from "@/components/ui/recent-blogs";
import { motion, useScroll, useTransform } from "framer-motion";
import { Hero } from "@/components/home/Hero"

const fadeInUp = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Container size="large">
        <Hero />
        {/* <SkillsShowcase /> */}
        <RecentBlogs />
      </Container>
    </main>
  );
}
