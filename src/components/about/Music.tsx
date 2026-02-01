"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Album {
  title: string;
  artist: string;
  year: number;
  description: string;
  imageUrl: string;
}

const favoriteAlbums: Album[] = [
  {
    title: "Vespertine",
    artist: "Björk",
    year: 2001,
    description: "A masterpiece of intimate electronic music that creates a winter wonderland of microscopic sounds. The album's delicate production and Björk's ethereal vocals craft a deeply personal and immersive sonic experience.",
    imageUrl: "/images/music/vespertine.webp"
  },
  {
    title: "Cosmogramma",
    artist: "Flying Lotus",
    year: 2010,
    description: "An otherworldly fusion of electronic, jazz, and experimental music that pushes the boundaries of production. The album's complex layering and cosmic soundscapes create a unique journey through sound and space.",
    imageUrl: "/images/music/cosmogramma.webp"
  },
  {
    title: "Hunky Dory",
    artist: "David Bowie",
    year: 1971,
    description: "A brilliant showcase of Bowie's songwriting prowess, combining folk rock with theatrical flair. From 'Changes' to 'Life on Mars?', each track demonstrates his unparalleled ability to blend profound lyrics with innovative arrangements.",
    imageUrl: "/images/music/hunky-dory.webp"
  },
  {
    title: "Titanic Rising",
    artist: "Weyes Blood",
    year: 2019,
    description: "A modern classic that channels 70s soft rock through a contemporary lens. Natalie Mering's stunning vocals and rich orchestration create a cinematic album that addresses both personal and universal themes with remarkable depth.",
    imageUrl: "/images/music/titanic-rising.webp"
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

export function Music() {
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
            <Badge variant="secondary">Soundscapes</Badge>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold text-stone-600">
                Favorite Albums
              </h2>
              <p className="text-lg max-w-prose">
                A selection of albums that showcase the boundless creativity and emotional depth of music.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {favoriteAlbums.map((album) => (
              <motion.div
                key={album.title}
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="flex flex-col h-full overflow-hidden group">
                  <div className="relative w-full h-64">
                    <Image
                      src={album.imageUrl}
                      alt={`${album.title} album cover`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{album.title}</CardTitle>
                    <CardDescription>
                      {album.artist} • {album.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{album.description}</p>
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