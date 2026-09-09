"use client";

import { m } from '@/lib/motion';
import Image from "next/image";

interface Album {
  title: string;
  artist: string;
  year: number;
  /**
   * A factual claim about the record. Required to carry a `source`, because the
   * first version of these was written from memory and the commit shipping it
   * said so — which is not enforcement, it is a confession with a git hash.
   * PRODUCT.md's binding constraint is "no unverifiable claims, ever", and the
   * timeline already meets it by reconciling every figure against a source.
   * This is the same standard applied to prose about other people.
   */
  description: string;
  /** Where the claim in `description` can be checked. Not optional. */
  source: { label: string; href: string };
  imageUrl: string;
}

const favoriteAlbums: Album[] = [
  {
    title: "Vespertine",
    artist: "Björk",
    year: 2001,
    description: "Built with Matmos out of beats made from crushing ice and shuffling cards, with footsteps in snow carrying one track and Zeena Parkins on harp. Björk picked sounds that would survive being downloaded off Napster.",
    imageUrl: "/images/music/vespertine.webp",
    source: { label: "Vespertine, Wikipedia", href: "https://en.wikipedia.org/wiki/Vespertine_(album)" }
  },
  {
    title: "Cosmogramma",
    artist: "Flying Lotus",
    year: 2010,
    description: "Recorded from October 2008, while Ellison was grieving his mother. Thundercat plays bass on half of it, Thom Yorke sings on one track, and the title comes from his great-aunt Alice Coltrane. It is the first of his records to lean on live players rather than programming.",
    imageUrl: "/images/music/cosmogramma.webp",
    source: { label: "Cosmogramma, Wikipedia", href: "https://en.wikipedia.org/wiki/Cosmogramma" }
  },
  {
    title: "Hunky Dory",
    artist: "David Bowie",
    year: 1971,
    description: "Rick Wakeman on piano, a year before Ziggy. \"Life on Mars?\" is a parody of \"My Way\" and borrows its opening chords, which reached Sinatra from a French song called \"Comme d'habitude\". \"Kooks\" he finished days after his son was born, and dedicated to him.",
    imageUrl: "/images/music/hunky-dory.webp",
    source: { label: "Hunky Dory, Wikipedia", href: "https://en.wikipedia.org/wiki/Hunky_Dory" }
  },
  {
    title: "Titanic Rising",
    artist: "Weyes Blood",
    year: 2019,
    description: "Mering produced it with Jonathan Rado. The cover — her submerged in a furnished bedroom — was shot by Brett Stanley in a Long Beach pool, which is about as literal as a record about climate dread gets.",
    imageUrl: "/images/music/titanic-rising.webp",
    source: { label: "Titanic Rising, Wikipedia", href: "https://en.wikipedia.org/wiki/Titanic_Rising" }
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
                {/* Rendered, not filed in a comment. The timeline's figures are
                    reconciled against a source the reader never sees, which the
                    design review called out; a claim a reader cannot check is
                    not sourced. */}
                <a
                  href={album.source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-mono mt-3 inline-flex min-h-6 items-center normal-case tracking-normal text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  Source: {album.source.label}
                </a>
              </m.div>
            ))}
          </m.div>
        </m.div>
      </div>
    </section>
  );
}