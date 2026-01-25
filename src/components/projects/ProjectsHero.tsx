"use client";

import { motion } from "framer-motion";
import { ThreeBackground } from "@/components/three/three-background";
import { AnimatedHeading, GradientText } from "@/components/ui/animated-text";
import { TiltCard } from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import { getFeaturedProjects, getAllTechnologies, products } from "@/constants/products";
import { Code2, Layers, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function ProjectsHero() {
  const featuredProjects = getFeaturedProjects().slice(0, 3);
  const technologies = getAllTechnologies();
  const totalProjects = products.length;

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Three.js Background */}
      <ThreeBackground type="particles" className="absolute inset-0 -z-10" />

      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 -z-5 bg-gradient-to-b from-background/50 via-background/80 to-background" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          {/* Hero Text */}
          <motion.div variants={itemVariants} className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Star className="h-3 w-3 mr-1.5 fill-primary text-primary" />
              Portfolio
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="block">
                <AnimatedHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl">
                  Building the Future
                </AnimatedHeading>
              </span>
              <span className="block mt-2">
                with <GradientText>AI & Code</GradientText>
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collection of projects spanning AI/ML, web applications, and developer tools.
              Each project represents a solution to a real-world problem.
            </p>
          </motion.div>

          {/* Stats Banner */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <div className="text-sm text-muted-foreground">Projects</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{technologies.length}+</div>
                <div className="text-sm text-muted-foreground">Technologies</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{featuredProjects.length}</div>
                <div className="text-sm text-muted-foreground">Featured</div>
              </div>
            </div>
          </motion.div>

          {/* Featured Projects Preview */}
          <motion.div variants={itemVariants} className="pt-8">
            <h2 className="text-center text-sm font-medium text-muted-foreground mb-6">
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <TiltCard
                  key={project.slug}
                  tiltAmount={6}
                  scale={1.02}
                  glareOpacity={0.05}
                  className="h-full"
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    className="block group"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm h-full"
                    >
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={project.thumbnail}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                          <span className="text-xs text-muted-foreground">Featured</span>
                        </div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                        {project.stack && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {project.stack.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                </TiltCard>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
