"use client";

import { motion, useInView } from "framer-motion";
import { Music2, Tv, MapPin, Coffee, Camera, Code2, Globe, Church, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";

const favorites = [
  {
    icon: Music2,
    label: "Favorite Band",
    value: "Arctic Monkeys"
  },
  {
    icon: Tv,
    label: "Favorite TV Shows",
    value: "One Piece / SpongeBob (tied)"
  },
  {
    icon: Tv,
    label: "Favorite Comedy Show",
    value: "Portlandia"
  },
  {
    icon: MapPin,
    label: "Favorite City",
    value: "Pasadena, CA"
  },
  {
    icon: Coffee,
    label: "Favorite Coffee",
    value: "Rose City Coffee Co."
  },
  {
    icon: Camera,
    label: "Camera",
    value: "Fujifilm XT30 II"
  },
  {
    icon: Code2,
    label: "Favorite Programming Language",
    value: "Rust"
  },
  {
    icon: Globe,
    label: "Preferred Internet Policy",
    value: "Open, Free, Neutral"
  },
  {
    icon: Church,
    label: "Religious Views",
    value: "Agnostic (but love learning about religion)"
  },
  {
    icon: Music,
    label: "Weird Skill",
    value: "I can play the Scottish Border Bagpipes"
  },
];

export function PersonalFavorites() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20
    },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24">
      <div className="w-full max-w-7xl mx-auto" ref={containerRef}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="flex flex-col gap-10"
        >
          <motion.div variants={itemVariants} className="flex gap-4 flex-col items-start">
            <Badge variant="secondary">The Essentials</Badge>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold">
                Personal Favorites
              </h2>
              <p className="text-lg max-w-prose text-muted-foreground">
                The small things that make me who I am.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map((favorite) => (
              <motion.div
                key={favorite.label}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="flex items-start gap-4 p-4 rounded-xl neu-card"
              >
                <div className="shrink-0 size-10 flex items-center justify-center rounded-full neu-pressed-sm text-primary">
                  <favorite.icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {favorite.label}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {favorite.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="mt-4">
            <p className="text-lg text-muted-foreground italic">
              &quot;What are some of the topics I write about as well as enjoy reading? Generally you&apos;ll see me covering: Mindfulness, the state of media (Indie Art, Sci-Fi), consumerism and privacy, and anything else that strikes my fancy.&quot;
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
