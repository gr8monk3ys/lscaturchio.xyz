import { Container } from "@/components/Container";
import { AboutHero } from "@/components/about/Hero";
import { AboutJourney } from "@/components/about/Journey";
import { PersonalFavorites } from "@/components/about/PersonalFavorites";
import { Interests } from "@/components/about/Interests";
import { ResumeDownloadButton } from "@/components/ui/resume-download-button";
import { Music } from "@/components/about/Music";
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Book, Film, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Lorenzo Scaturchio",
  description:
    "Data Scientist from Southern California who loves Arctic Monkeys, plays Scottish bagpipes, produces music, and explores the intersection of technology and human consciousness.",
};

export default function AboutPage() {
  return (
    <Container size="large">
      <div className="space-y-8">
        <AboutHero />
        <PersonalFavorites />
        <AboutJourney />
        <Interests />
        <Music />

        {/* Teaser links to dedicated pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/books"
            className="group p-6 rounded-2xl neu-card hover:scale-[1.02] transition-[transform,box-shadow]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  Books I Love
                </h3>
                <p className="text-sm text-muted-foreground">
                  Philosophy, psychology, and meaningful reads
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-[transform,color]" />
            </div>
          </Link>

          <Link
            href="/movies"
            className="group p-6 rounded-2xl neu-card hover:scale-[1.02] transition-[transform,box-shadow]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Film className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  Films I Cherish
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cinema that shaped my perspective
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-[transform,color]" />
            </div>
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
