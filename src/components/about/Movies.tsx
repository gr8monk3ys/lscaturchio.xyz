"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Movie {
  title: string;
  director: string;
  year: number;
  description: string;
  imageUrl: string;
}

const favoriteMovies: Movie[] = [
  {
    title: "Cinema Paradiso",
    director: "Giuseppe Tornatore",
    year: 1988,
    description: "A beautiful tale of love, nostalgia, and the magic of cinema. This film resonates with me deeply as it captures the transformative power of movies and how they shape our lives, memories, and relationships.",
    imageUrl: "/images/movies/cinema-paradiso.webp"
  },
  {
    title: "Dancer in the Dark",
    director: "Lars von Trier",
    year: 2000,
    description: "A heart-wrenching musical drama that showcases Björk's incredible performance. The film's unique approach to the musical genre and its exploration of sacrifice and motherhood creates an unforgettable emotional experience.",
    imageUrl: "/images/movies/dancer-in-the-dark.webp"
  },
  {
    title: "Ikiru",
    director: "Akira Kurosawa",
    year: 1952,
    description: "Kurosawa's masterpiece about finding meaning in life. The story of a bureaucrat discovering purpose in his final days speaks to the universal human experience and reminds us of the importance of making our lives meaningful.",
    imageUrl: "/images/movies/ikiru.webp"
  },
  {
    title: "Before Sunrise",
    director: "Richard Linklater",
    year: 1995,
    description: "A perfect capture of youth, romance, and meaningful connection. The naturalistic dialogue and chemistry between the leads creates an intimate portrait of two strangers sharing a brief but profound connection.",
    imageUrl: "/images/movies/before-sunrise.webp"
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
      ease: "easeOut"
    }
  },
  hover: {
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export function Movies() {
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
            <Badge variant="secondary">Cinema</Badge>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold text-stone-600">
                Favorite Films
              </h2>
              <p className="text-lg max-w-prose">
                A collection of films that have profoundly impacted my perspective on storytelling and life.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {favoriteMovies.map((movie) => (
              <motion.div
                key={movie.title}
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="flex flex-col h-full overflow-hidden group">
                  <div className="relative w-full h-64">
                    <Image
                      src={movie.imageUrl}
                      alt={`${movie.title} poster`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{movie.title}</CardTitle>
                    <CardDescription>
                      Directed by {movie.director} • {movie.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{movie.description}</p>
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