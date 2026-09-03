import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { GiscusComments } from "@/components/blog/giscus-comments";
import { PageHead } from "@/components/ui/page-head";

export const metadata = buildPageMetadata({
  title: "Guestbook",
  description: "Leave a note, ask a question, or just say hi.",
  path: "/guestbook",
});

export default function GuestbookPage() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-3xl mx-auto">
        <PageHead
          className="mb-12"
          kicker="Garden · Guestbook"
          title="Guestbook"
          blurb={
            <>
              Leave a note, share feedback, or ask me something. If you&apos;re logged
              into GitHub, you can post directly below.
            </>
          }
        />

        <GiscusComments showFallback />
      </div>
    </Container>
  );
}

