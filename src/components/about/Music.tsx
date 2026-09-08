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
    description: "Built with Matmos out of microbeats made from domestic noise — shuffled cards, cracking ice, footsteps — with Zeena Parkins on harp. Björk has said she mixed it for laptop speakers and headphones, because that was where people were about to hear everything.",
    imageUrl: "/images/music/vespertine.webp"
  },
  {
    title: "Cosmogramma",
    artist: "Flying Lotus",
    year: 2010,
    description: "Steven Ellison made it after his mother died, and it plays like grief with the seams left in. Thundercat on bass throughout, Thom Yorke on one track, and the harp lineage of his great-aunt Alice Coltrane running underneath the drum programming.",
    imageUrl: "/images/music/cosmogramma.webp"
  },
  {
    title: "Hunky Dory",
    artist: "David Bowie",
    year: 1971,
    description: "Rick Wakeman on piano, a year before Ziggy. \"Life on Mars?\" exists because Bowie wrote an English lyric for the French song that became \"My Way\", lost the job to Paul Anka, and wrote his own over the same shape. \"Kooks\" he wrote for his newborn son.",
    imageUrl: "/images/music/hunky-dory.webp"
  },
  {
    title: "Titanic Rising",
    artist: "Weyes Blood",
    year: 2019,
    description: "Natalie Mering co-produced it with Jonathan Rado. The cover — a bedroom furnished and then flooded — was shot in a water tank, which is about as literal as an album about climate dread and drowning nostalgia can get.",
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
                Favorite albums
              </h2>
              <p className="text-lg max-w-prose">
                Four I keep going back to, and what is actually going on in them.
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
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
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