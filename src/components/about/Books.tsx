"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Book {
  title: string;
  author: string;
  year: number;
  description: string;
  imageUrl: string;
}

const favoriteBooks: Book[] = [
  {
    title: "The Red Book: Liber Novus",
    author: "Carl Gustav Jung",
    year: 2009,
    description: "A profound journey into the depths of Jung's psyche, this illuminated manuscript blends psychology, mythology, and personal revelation. Its publication after nearly a century reveals the foundation of analytical psychology through Jung's own confrontation with the unconscious.",
    imageUrl: "/images/books/red-book.webp"
  },
  {
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    year: 1946,
    description: "Through the lens of his experiences in Nazi concentration camps, Frankl explores humanity's quest for purpose. His logotherapy approach suggests that our primary drive is not pleasure, but the discovery and pursuit of what we find meaningful.",
    imageUrl: "/images/books/mans-search-for-meaning.webp"
  },
  {
    title: "Thus Spoke Zarathustra",
    author: "Friedrich Nietzsche",
    year: 1883,
    description: "A philosophical novel that challenges conventional morality and introduces concepts like the Übermensch and eternal recurrence. Through Zarathustra's speeches, Nietzsche presents a radical vision of self-overcoming and life-affirmation.",
    imageUrl: "/images/books/thus-spoke-zarathustra.webp"
  },
  {
    title: "The Stranger",
    author: "Albert Camus",
    year: 1942,
    description: "A masterpiece of absurdist fiction that explores the philosophical concept of the absurd. Through Meursault's detached narrative, Camus examines the tension between individual authenticity and society's demands for conformity.",
    imageUrl: "/images/books/the-stranger.webp"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  },
  hover: {
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const
    }
  }
};

export function Books() {
  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-10"
        >
          <motion.div variants={cardVariants} className="flex gap-4 flex-col items-start">
            <Badge variant="secondary">Philosophy</Badge>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold text-stone-600">
                Essential Reads
              </h2>
              <p className="text-lg max-w-prose">
                A curated selection of books that explore the depths of human consciousness, meaning, and existence.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {favoriteBooks.map((book) => (
              <motion.div
                key={book.title}
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="flex flex-col h-full overflow-hidden group">
                  <div className="relative w-full h-64">
                    <Image
                      src={book.imageUrl}
                      alt={`${book.title} cover`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{book.title}</CardTitle>
                    <CardDescription>
                      {book.author} • {book.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{book.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}