import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { GiscusComments } from "@/components/blog/giscus-comments";
import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Guestbook | Lorenzo Scaturchio",
  description: "Leave a note, ask a question, or just say hi.",
};

export default function GuestbookPage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Guestbook</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            Leave a note, share feedback, or ask me something. If you&apos;re logged
            into GitHub, you can post directly below.
          </Paragraph>
        </div>

        <GiscusComments showFallback />
      </div>
    </Container>
  );
}

