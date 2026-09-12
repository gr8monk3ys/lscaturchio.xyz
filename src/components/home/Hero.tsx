import Image from "next/image";
import { HeroAsk } from "@/components/home/hero-ask";

export function Hero() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 py-16 md:grid-cols-[1fr_minmax(0,300px)] md:items-end md:py-24 lg:py-28">
        {/* The name is the work; everything else is the wall label. */}
        <div className="min-w-0 space-y-6">
          <span className="label-mono block">Essays · Systems · Los Angeles</span>

          <h1 className="text-balance text-display">
            Hey, I&apos;m <span className="text-primary">Lorenzo Scaturchio</span>
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
            I build AI systems and I&apos;m suspicious of them. I write about power,
            attention, and what institutions are actually built to do.
          </p>
        </div>

        {/* Framed portrait plate with a mono caption, like a gallery placard. */}
        <figure className="mx-auto w-44 sm:w-52 md:mx-0 md:w-full md:max-w-[300px]">
          <div className="relative aspect-square overflow-hidden border border-border">
            <Image
              src="/images/portrait.webp"
              alt="Lorenzo Scaturchio"
              fill
              priority
              sizes="(max-width: 768px) 208px, 300px"
              className="object-cover"
            />
          </div>
          {/* Two deliberate lines, not three ragged ones.
              "LORENZO SCATURCHIO · LOS ANGELES" is 32 characters of 11.52px
              uppercase mono at 0.16em tracking — about 285px — set beneath a
              176px plate. It wrapped to "LORENZO / SCATURCHIO · LOS / ANGELES"
              and was wider than the thing it labels, on the site's signature
              element. A placard names the work and then the place on its own
              line, so stacking is the metaphor rather than a concession, and
              the longest line is now ~160px against that 176px plate.

              No `/80` on the second line: an opacity modifier on
              `text-muted-foreground` is what put /lab's snippets at 3.48:1. */}
          <figcaption className="label-mono mt-3 space-y-0.5">
            <span className="block">Lorenzo Scaturchio</span>
            <span className="block">Los Angeles</span>
          </figcaption>
        </figure>
      </div>

      <HeroAsk />
    </section>
  );
}
