import { Container } from "@/components/Container";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import {
  readSearchParam,
  type SearchParamValue,
} from "@/lib/search-params";

const ChatPageClient = dynamic(() => import("@/components/chat/chat-page-client").then(m => m.ChatPageClient));

export const metadata = {
  title: "Chat",
  description: "Chat with an AI version of Lorenzo, grounded in blog and site content.",
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
    <Container size="small">
      <Suspense fallback={<div className="neu-card min-h-[70vh] rounded-2xl p-6 text-sm text-muted-foreground">Loading chat...</div>}>
        <ChatPageClient
          contextSlug={contextSlug}
          contextTitle={contextTitle}
          initialQuery={initialQuery}
        />
      </Suspense>
    </Container>
  );
}
