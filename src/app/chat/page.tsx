import { Container } from "@/components/Container";
import dynamic from "next/dynamic";

const ChatPageClient = dynamic(() => import("@/components/chat/chat-page-client").then(m => m.ChatPageClient));

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
