import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code, Music, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[55vh] sm:min-h-[60vh] w-full flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute top-8 right-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-6 left-10 h-48 w-48 rounded-full bg-accent/35 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full overflow-hidden">
            <Image
              src="/images/portrait.webp"
              alt="Lorenzo Scaturchio"
              fill
              priority
              sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 208px"
              className="rounded-full object-cover"
            />
          </div>

          <div className="text-center md:text-left space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              Applied ML + RAG Systems
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Hey, I&apos;m <span className="text-primary">Lorenzo Scaturchio</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              I build practical RAG and ML systems that ship cleanly, feel human, and stay
              reliable in production.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground/80">
              Ship real systems, not demos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-5 pt-2">
          <div className="w-full text-center text-xs sm:text-sm text-muted-foreground/80">
            For teams shipping RAG, applied ML, and production-grade data products.
          </div>
          <Button asChild size="lg" variant="primary" className="text-base sm:text-lg h-11 px-7">
            <Link href="/projects">
              View My Work
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="cta-secondary text-base sm:text-lg h-11 px-7">
            <Link href="/contact">
              Contact Me
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-2">
          {[
            { icon: Code, text: "Data Science" },
            { icon: Music, text: "Music" },
            { icon: Mountain, text: "Outdoors" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
