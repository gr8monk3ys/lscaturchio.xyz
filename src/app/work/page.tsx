import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { WorkTimeline } from "@/components/ui/work-timeline";
import { DownloadButton } from "@/components/ui/download-button";

export const metadata = {
  title: "Work | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio is a developer, writer and speaker. He is a digital nomad and travels around the world while working remotely.",
};

export default function Home() {
  return (
    <Container size="large">
      <div className="space-y-8">
        <Heading className="font-black">Work</Heading>

        <WorkTimeline />
        <DownloadButton href="/Lorenzo_resume_DS.pdf" />
      </div>
    </Container>
  );
}
