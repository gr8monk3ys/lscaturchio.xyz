import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Highlight } from "@/components/Highlight";
import { Paragraph } from "@/components/Paragraph";
import { Products } from "@/components/Products";
import { WorkHistory } from "@/components/WorkHistory";
import { WorkTimeline } from "@/components/ui/work-timeline";
import Image from "next/image";

export default function Home() {
  return (
    <Container>
      <WorkTimeline />
    </Container>
  );
}
