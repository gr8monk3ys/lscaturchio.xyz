import { Container } from "@/components/Container";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import {
  readSearchParam,
  type SearchParamValue,
} from "@/lib/search-params";

const ChatPageClient = dynamic(() => import("@/components/chat/chat-page-client").then(m => m.ChatPageClient));

export const metadata = {
  title: "Ask",
  description: "Ask a question and get an answer drawn from the essays on this site, with the passages it read.",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const contextSlug = readSearchParam(params, "contextSlug");
  const contextTitle = readSearchParam(params, "contextTitle");
  const initialQuery = readSearchParam(params, "q");

  return (
    <Container size="medium">
      {/* The fallback says what is true rather than "Loading chat…".
          React parks this boundary's content in a hidden div for a script to
          reveal, so the fallback is not a moment — it is the whole page for a
          reader without JavaScript. Asking a question genuinely needs scripts;
          claiming to be loading does not become true by being patient. */}
      <Suspense
        fallback={
          <div className="neu-card min-h-[70vh] rounded-2xl p-6 text-sm text-muted-foreground">
            Asking a question needs JavaScript, because the answer is composed in
            the browser as it arrives. The essays it draws on are all readable
            without it — start at <a className="label-link underline underline-offset-4" href="/blog">the writing</a>.
          </div>
        }
      >
        <ChatPageClient
          contextSlug={contextSlug}
          contextTitle={contextTitle}
          initialQuery={initialQuery}
        />
      </Suspense>
    </Container>
  );
}
