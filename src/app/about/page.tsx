import { Container } from "@/components/Container";
import { AboutHero } from "@/components/about/Hero";
import { AboutJourney } from "@/components/about/Journey";
import { PersonalFavorites } from "@/components/about/PersonalFavorites";
import { Interests } from "@/components/about/Interests";
import { WorkTimeline } from "@/components/ui/work-timeline";
import { DownloadButton } from "@/components/ui/download-button";
import { Movies } from "@/components/about/Movies";
import { Music } from "@/components/about/Music";
import { Books } from "@/components/about/Books";
import { Metadata } from "next";

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
        <Movies />
        <Music />
        <Books />
        <DownloadButton href="/Lorenzo_resume_DS.pdf" />
      </div>
    </Container>
  );
}
