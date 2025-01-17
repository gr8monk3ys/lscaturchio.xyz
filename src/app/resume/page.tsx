import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Highlight } from "@/components/Highlight";
import { Paragraph } from "@/components/Paragraph";
import { Products } from "@/components/Products";
import { WorkHistory } from "@/components/WorkHistory";
import { WorkTimeline } from "@/components/ui/work-timeline";
import { DownloadButton } from "@/components/ui/download-button";
import Image from "next/image";

export const metadata = {
  title: "Resume | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio is a developer, writer and speaker. He is a digital nomad and travels around the world while working remotely.",
};

export default function Home() {
  return (
    <Container size="large">
      <div className="space-y-8">
        <Heading className="font-black">Resume</Heading>

        <WorkTimeline />
        <DownloadButton href="/Lorenzo_resume_DS.pdf" />
      </div>
    </Container>
  );
}
