import { Container } from "@/components/Container";
import { ChatPageClient } from "@/components/chat/chat-page-client";

export const metadata = {
  title: "Chat | Lorenzo Scaturchio",
  description: "Chat with an AI version of Lorenzo, grounded in blog and site content.",
};

export default function ChatPage() {
  return (
    <Container size="small">
      <ChatPageClient />
    </Container>
  );
}
