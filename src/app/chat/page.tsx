import { Container } from "@/components/Container";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ChatPageClient = dynamic(() => import("@/components/chat/chat-page-client").then(m => m.ChatPageClient));

type SearchParamValue = string | string[] | undefined;

function getSearchParamValue(params: Record<string, SearchParamValue>, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export const metadata = {
  title: "Chat | Lorenzo Scaturchio",
  description: "Chat with an AI version of Lorenzo, grounded in blog and site content.",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const contextSlug = getSearchParamValue(params, "contextSlug");
  const contextTitle = getSearchParamValue(params, "contextTitle");
  const initialQuery = getSearchParamValue(params, "q");

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
