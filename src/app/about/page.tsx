import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { AboutHero } from "@/components/about/Hero";
import { AboutJourney } from "@/components/about/Journey";
import { PersonalFavorites } from "@/components/about/PersonalFavorites";
import { Interests } from "@/components/about/Interests";
import { ResumeDownloadButton } from "@/components/ui/resume-download-button";
import { Music } from "@/components/about/Music";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = buildPageMetadata({
  title: "About",
  description: "AI engineer and essayist from Southern California who loves Arctic Monkeys, plays Scottish bagpipes, produces music, and explores the intersection of technology and human consciousness.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container size="large">
      <div className="space-y-8">
        <AboutHero />
        <PersonalFavorites />
        <AboutJourney />
        <Interests />
        <Music />

        {/* Teaser links to dedicated pages — de-carded hairline rows */}
        <div className="mt-12 grid grid-cols-1 divide-border border-y border-border md:grid-cols-2 md:divide-x">
          <Link
            href="/books"
            className="group flex items-center gap-4 py-6 md:pr-8"
          >
            <div className="flex-1">
              <span className="label-mono block">Garden · Reading</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                Books I Love
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Philosophy, psychology, and meaningful reads
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-[transform,color]" />
          </Link>

          <Link
            href="/movies"
            className="group flex items-center gap-4 py-6 md:pl-8"
          >
            <div className="flex-1">
              <span className="label-mono block">Garden · Cinema</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                Films I Cherish
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cinema that shaped my perspective
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-[transform,color]" />
          </Link>
        </div>
        <Suspense fallback={<div className="flex justify-center mt-16"><span className="text-muted-foreground">Loading...</span></div>}>
          <div className="flex justify-center mt-16">
            <ResumeDownloadButton />
          </div>
        </Suspense>
      </div>
    </Container>
  );
}
