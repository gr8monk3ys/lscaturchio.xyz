"use client";

import { m } from '@/lib/motion';
import Image from "next/image";

interface Album {
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
}

const favoriteAlbums: Album[] = [
  {
    title: "Vespertine",
    artist: "Björk",
    year: 2001,
    imageUrl: "/images/music/vespertine.webp"
  },
  {
    title: "Cosmogramma",
    artist: "Flying Lotus",
    year: 2010,
    imageUrl: "/images/music/cosmogramma.webp"
  },
  {
    title: "Hunky Dory",
    artist: "David Bowie",
    year: 1971,
    imageUrl: "/images/music/hunky-dory.webp"
  },
  {
    title: "Titanic Rising",
    artist: "Weyes Blood",
    year: 2019,
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
              <h2 className="text-section-title text-foreground">
                Favorite albums
              </h2>
              <p className="text-lg max-w-prose">
                Four I keep going back to.
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
                <h3 className="mt-4 text-card-title text-foreground">
                  {album.title}
                </h3>
                <p className="label-mono mt-2">
                  {album.artist} · {album.year}
                </p>
              </m.div>
            ))}
          </m.div>
        </m.div>
      </div>
    </section>
  );
}