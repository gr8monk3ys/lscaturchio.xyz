"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

// Hidden projects/experiments that aren't on the main portfolio
const HIDDEN_PROJECTS = [
  {
    name: "ASCII Art Generator",
    description: "Converts images to ASCII art. Built for fun on a weekend.",
    tech: ["Python", "PIL"],
    status: "Archived",
  },
  {
    name: "CLI Pomodoro Timer",
    description: "Terminal-based Pomodoro timer with notifications.",
    tech: ["Rust"],
    status: "Active",
  },
  {
    name: "Vim Config",
    description: "My overly complicated Neovim configuration.",
    tech: ["Lua", "Neovim"],
    status: "Always WIP",
  },
];

// Fun personal facts
const SECRET_FACTS = [
  "I can solve a Rubik's cube in under 2 minutes",
  "My first computer was running Windows 98",
  "I have a collection of 200+ vinyl records",
  "I once stayed up for 36 hours straight debugging a race condition",
  "My most used emoji is probably the thinking face",
  "I learned to code by modding Minecraft servers",
  "I have strong opinions about tab vs spaces (tabs)",
  "My desk has at least 3 half-empty coffee mugs at any time",
];

// Favorite dev memes/jokes
const DEV_JOKES = [
  {
    setup: "Why do programmers prefer dark mode?",
    punchline: "Because light attracts bugs.",
  },
  {
    setup: "A SQL query walks into a bar, walks up to two tables and asks...",
    punchline: '"Can I join you?"',
  },
  {
    setup: "Why do Java developers wear glasses?",
    punchline: "Because they don't C#.",
  },
  {
    setup: "How many programmers does it take to change a light bulb?",
    punchline: "None. It's a hardware problem.",
  },
  {
    setup: "!false",
    punchline: "It's funny because it's true.",
  },
];

// Easter egg hints for other hidden features
const EASTER_EGG_HINTS = [
  "Try the Konami code anywhere on the site...",
  "Check the browser console for a message",
  "There might be more secrets hiding in plain sight",
  "Some things are only visible in dark mode",
];

export function SecretPageContent() {
  const [revealedJoke, setRevealedJoke] = useState<number | null>(null);
  const [factIndex, setFactIndex] = useState(0);

  const currentJoke = DEV_JOKES[revealedJoke ?? 0];

  const nextFact = () => {
    setFactIndex((prev) => (prev + 1) % SECRET_FACTS.length);
  };

  return (
    <main id="main-content" className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" as const, damping: 10 }}
          >
            🎉
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            You Found the Secret Page!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to the hidden corner of my website. Here are some things that
            didn&apos;t quite make it to the main pages.
          </p>
        </motion.div>

        {/* Hidden Projects */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🔬</span> Hidden Experiments
          </h2>
          <div className="grid gap-4">
            {HIDDEN_PROJECTS.map((project, index) => (
              <motion.div
                key={project.name}
                className="bg-muted/30 border border-border rounded-xl p-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {project.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {project.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Random Fact Generator */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🎲</span> Random Facts About Me
          </h2>
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-border rounded-xl p-6 text-center">
            <motion.p
              key={factIndex}
              className="text-lg mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              &quot;{SECRET_FACTS[factIndex]}&quot;
            </motion.p>
            <button
              onClick={nextFact}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Another Fact
            </button>
          </div>
        </motion.section>

        {/* Dev Jokes */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>😄</span> Developer Humor
          </h2>
          <div className="grid gap-3">
            {DEV_JOKES.map((joke, index) => (
              <motion.button
                key={index}
                className="text-left bg-muted/30 border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
                onClick={() =>
                  setRevealedJoke(revealedJoke === index ? null : index)
                }
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <p className="font-medium">{joke.setup}</p>
                <motion.p
                  className="text-muted-foreground mt-2"
                  initial={false}
                  animate={{
                    opacity: revealedJoke === index ? 1 : 0,
                    height: revealedJoke === index ? "auto" : 0,
                  }}
                >
                  {joke.punchline}
                </motion.p>
                {revealedJoke !== index && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Click to reveal
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Easter Egg Hints */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🥚</span> More Secrets?
          </h2>
          <div className="bg-muted/30 border border-border rounded-xl p-6">
            <p className="text-muted-foreground mb-4">
              This isn&apos;t the only hidden feature on the site. Here are some
              hints:
            </p>
            <ul className="space-y-2">
              {EASTER_EGG_HINTS.map((hint, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <span className="text-primary">→</span>
                  <span>{hint}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Back to home */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <span>←</span>
            <span>Back to the regular website</span>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
