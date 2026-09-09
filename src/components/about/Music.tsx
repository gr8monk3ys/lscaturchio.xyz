"use client";

import { m } from '@/lib/motion';
import Image from "next/image";

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

// Static, and no hover lift.
//
// The `hover: { y: -10 }` variant was a lift on a content surface, which the
// Flat Paper Rule forbids outright: a hovered surface changes tint and border
// colour, it does not rise. The opacity-0 entrance states went with it — five
// other components on this site carry comments about that exact pattern
// stranding a block at zero opacity, and there is no reason to keep the last
// copy of it for a list of four albums.
const containerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const cardVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

export function Music() {
  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24">
      <div className="w-full max-w-6xl mx-auto">
        <m.div
          variants={containerVariants}
          initial={false}
          animate="visible"
          className="flex flex-col gap-10"
        >
          <m.div variants={cardVariants} className="flex gap-4 flex-col items-start">
            <span className="label-mono block">Soundscapes</span>
            <div className="flex gap-2 flex-col">
              <h2 className="font-display text-3xl md:text-5xl tracking-tight font-bold text-foreground">
                Favorite Albums
              </h2>
              <p className="text-lg max-w-prose">
                A selection of albums that showcase the boundless creativity and emotional depth of music.
              </p>
            </div>
          </m.div>

          <m.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {favoriteAlbums.map((album) => (
              <m.div
                key={album.title}
                variants={cardVariants}
                className="group flex flex-col"
              >
                <div className="relative w-full h-64 overflow-hidden border border-border bg-muted">
                  <Image
                    src={album.imageUrl}
                    alt={`${album.title} album cover`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
                  {album.title}
                </h3>
                <p className="label-mono mt-2">
                  {album.artist} · {album.year}
                </p>
                <p className="mt-3 text-muted-foreground">{album.description}</p>
              </m.div>
            ))}
          </m.div>
        </m.div>
      </div>
    </section>
  );
}