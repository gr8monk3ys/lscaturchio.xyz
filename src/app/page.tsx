"use client";

import { Container } from "@/components/Container";
import { motion, useScroll, useTransform } from "framer-motion";
import { Hero } from "@/components/home/Hero";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
import { WebsiteStructuredData, PersonStructuredData } from "@/components/ui/structured-data";

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
      <WebsiteStructuredData 
        url="https://lscaturchio.xyz"
        name="Lorenzo Scaturchio | Developer & Designer"
        description="Personal website and portfolio of Lorenzo Scaturchio, showcasing projects, blog posts, and services."
        siteType="Portfolio"
      />
      <PersonStructuredData
        name="Lorenzo Scaturchio"
        description="Developer and Designer"
        image="https://lscaturchio.xyz/images/portrait.jpg"
        jobTitle="Developer & Designer"
        url="https://lscaturchio.xyz"
        sameAs={[
          "https://github.com/lscaturchio",
          "https://linkedin.com/in/lscaturchio"
        ]}
      />
      <Container size="large">
        <Hero />
        {/* <SkillsShowcase /> */}
        <RecentBlogs />
        <RecentProjects />
      </Container>
    </main>
  );
}
