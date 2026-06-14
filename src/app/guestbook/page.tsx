import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { GiscusComments } from "@/components/blog/giscus-comments";

export const metadata = buildPageMetadata({
  title: "Guestbook",
  description: "Leave a note, ask a question, or just say hi.",
  path: "/guestbook",
});

export default function GuestbookPage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <span className="label-mono block">Garden · Guestbook</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">Guestbook</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Leave a note, share feedback, or ask me something. If you&apos;re logged
            into GitHub, you can post directly below.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

        <GiscusComments showFallback />
      </div>
    </Container>
  );
}

