import Image from "next/image";
import { HeroAsk } from "@/components/home/hero-ask";

export function Hero() {
  return (
    /* The opening plate: a wide cell that speaks, and a tall portrait cell
       beside it. One column on a phone, the portrait second. */
    <section className="plate-grid w-full border-b border-rule md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="flex flex-col">
        <div className="plate-cell flex-1 space-y-6 pb-10 pt-8 md:pb-16 md:pt-12">
          <span className="label-mono block">Systems · Essays · Los Angeles</span>

          {/* Two inked lines, written one after the other (see `.ink-line`). */}
          <h1 className="text-balance text-page-title">
            <span className="ink-line">Hey, I&apos;m</span>{" "}
            <span className="ink-line text-primary">Lorenzo Scaturchio</span>
          </h1>

          {/* The statement, in the catalogue serif at display scale. */}
          <p className="text-statement max-w-[26em] text-foreground">
            I build AI and web tools that show their sources: retrieval that cites
            what it read, automation that only decides what it safely can. I also
            write essays about technology, attention and work.
          </p>

          {/* Underlined at rest: colour alone does not mark a link (WCAG 1.4.1). */}
          <p className="text-lede max-w-xl text-foreground">
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

        <HeroAsk />
      </div>

      {/* The portrait, in colour and as tall as the cell beside it. */}
      {/* Preloaded, but not `fetchPriority="high"`: on a phone this plate is
          full-width and sits below the Ask form, so the heading is the LCP
          there and the portrait must not jump ahead of the hand font. `sizes`
          follows the cell: the full viewport in one column, a third of it
          beside the statement. */}
      <figure className="flex flex-col">
        <div className="relative aspect-4/5 flex-1 md:aspect-auto md:min-h-[28rem]">
          <Image
            src="/images/portrait.webp"
            alt="Lorenzo Scaturchio"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 34vw"
            className="object-cover object-top"
          />
        </div>
        {/* A placard names the work and then the place. No `/80` on the second
            line: an opacity modifier on `text-muted-foreground` is what put
            /lab's snippets at 3.48:1. */}
        <figcaption className="label-mono plate-cell flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-t border-rule">
          <span>Lorenzo Scaturchio</span>
          <span>Los Angeles</span>
        </figcaption>
      </figure>
    </section>
  );
}
