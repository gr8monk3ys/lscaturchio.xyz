"use client";

import { m, useInView } from '@/lib/motion';
import { useRef } from "react";

const favorites = [
  {
    label: "Favorite Band",
    value: "Arctic Monkeys"
  },
  {
    label: "Favorite TV Shows",
    value: "One Piece / SpongeBob (tied)"
  },
  {
    label: "Favorite Comedy Show",
    value: "Portlandia"
  },
  {
    label: "Favorite City",
    value: "Pasadena, CA"
  },
  {
    label: "Favorite Coffee",
    value: "Rose City Coffee Co."
  },
  {
    label: "Camera",
    value: "Fujifilm XT30 II"
  },
  {
    label: "Favorite Programming Language",
    value: "Rust"
  },
  {
    label: "Preferred Internet Policy",
    value: "Open, Free, Neutral"
  },
  {
    label: "Religious Views",
    value: "Agnostic (but love learning about religion)"
  },
  {
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
        <m.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="flex flex-col gap-10"
        >
          <m.div variants={itemVariants} className="flex gap-4 flex-col items-start">
            <span className="label-mono block">The Essentials</span>
            <div className="flex gap-2 flex-col">
              <h2 className="font-display text-3xl md:text-5xl tracking-tight font-bold">
                Personal Favorites
              </h2>
              <p className="text-lg max-w-prose text-muted-foreground">
                The small things that make me who I am.
              </p>
            </div>
          </m.div>

          <div className="grid grid-cols-1 divide-border border-y border-border sm:grid-cols-2 sm:divide-x">
            {favorites.map((favorite) => (
              <m.div
                key={favorite.label}
                variants={itemVariants}
                className="px-5 py-6"
              >
                <p className="label-mono">
                  {favorite.label}
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {favorite.value}
                </p>
              </m.div>
            ))}
          </div>

          <m.div variants={itemVariants} className="mt-4">
            <p className="text-lg text-muted-foreground italic">
              &quot;What are some of the topics I write about as well as enjoy reading? Generally you&apos;ll see me covering: Mindfulness, the state of media (Indie Art, Sci-Fi), consumerism and privacy, and anything else that strikes my fancy.&quot;
            </p>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
