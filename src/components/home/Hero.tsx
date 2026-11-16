import Image from "next/image";
import { HeroAsk } from "@/components/home/hero-ask";

export function Hero() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 py-16 md:grid-cols-[1fr_minmax(0,300px)] md:items-end md:py-24 lg:py-28">
        {/* The name is the work; everything else is the wall label. */}
        <div className="min-w-0 space-y-6">
          <span className="label-mono block">Systems · Essays · Los Angeles</span>

          <h1 className="text-balance text-display">
            Hey, I&apos;m <span className="text-primary">Lorenzo Scaturchio</span>
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
            I build AI and web tools that show their sources: retrieval that cites
            what it read, automation that only decides what it safely can. I also
            write essays about technology, attention and work.
          </p>

          {/* Underlined at rest: colour alone does not mark a link (WCAG 1.4.1). */}
          <p className="max-w-xl text-base text-muted-foreground">
            Right now that work is{" "}
            <a
              href="https://www.vivancedata.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              VivanceData
            </a>
            , which brings it to construction, HVAC, logistics and manufacturing businesses.
          </p>
        </div>

        {/* Framed portrait plate with a mono caption, like a gallery placard. */}
        {/* Flush left below md, not centred.
            `mx-auto` put the plate at x=102 on a 390px screen while the
            kicker, the h1 and the lede all start at x=16 — the documented
            `1fr / 300px` editorial split collapses to one column on a phone,
            and a centred plate in a left-aligned stack reads as a stray
            snapshot rather than as the masthead's other half. */}
        {/* This plate is the mobile LCP element. `priority` alone only emits the
            preload link in Next 16; the `fetchPriority="high"` attribute on the
            image element itself is what moves the request ahead of the font and script
            queue. The `sizes` list mirrors the three widths above so a phone
            fetches a 176px-plate candidate rather than the 208px one. */}
        <figure className="w-44 sm:w-52 md:w-full md:max-w-[300px]">
          <div className="relative aspect-square overflow-hidden border border-border">
            <Image
              src="/images/portrait.webp"
              alt="Lorenzo Scaturchio"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 640px) 176px, (max-width: 768px) 208px, 300px"
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
