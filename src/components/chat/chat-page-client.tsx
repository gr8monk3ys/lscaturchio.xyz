"use client";

import { useEffect, useState, FormEvent, KeyboardEvent } from "react";
import { Paperclip, Mic, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/logger";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/chat/chat-bubble";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import Link from "next/link";

interface ChatMessage {
  id: number;
  content: string;
  sender: "user" | "ai";
}

// POV-forward openers — the chat is an interactive version of Lorenzo's
// thinking, not a search box. Lead with provocation, not "how can I help".
const STARTER_PROMPTS = [
  "What's your most contrarian take?",
  "Argue with me: isn't meritocracy basically fair?",
  "What did you used to believe that you've since changed your mind on?",
  "Pick a fight with Silicon Valley for me.",
];

interface ChatPageClientProps {
  contextSlug?: string;
  contextTitle?: string;
  initialQuery?: string;
}

export function ChatPageClient({
  contextSlug = "",
  contextTitle = "",
  initialQuery = "",
}: ChatPageClientProps) {

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      content:
        "I'm an AI trained on everything Lorenzo has written — the essays, the code notes, the opinions. Ask what he thinks. Or push back and argue.",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Seed the input from URL params (non-destructive)
  useEffect(() => {
    if (!initialQuery) return;
    setInput((prev) => (prev.trim().length > 0 ? prev : initialQuery));
  }, [initialQuery]);

  const sendMessage = async (raw: string) => {
    const query = raw.trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      content: query,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, contextSlug: contextSlug || undefined }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          `Chat request failed with status ${response.status}`
        );
      }
      const payload = data?.data ?? data;
      const answer =
        typeof payload?.answer === "string" && payload.answer.trim().length > 0
          ? payload.answer
          : null;
      if (!answer) {
        throw new Error("Chat response missing answer");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: answer,
          sender: "ai",
        },
      ]);
    } catch (error) {
      logError("Chat request failed", error, {
        component: "ChatPageClient",
        action: "handleSubmit",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content:
            "I’m having trouble responding right now. Please try again in a moment.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="neu-card flex min-h-[70vh] flex-col rounded-2xl">
      <div className="px-5 py-4 border-b">
        <h1 className="text-xl font-semibold">Chat with Lorenzo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Powered by RAG over blog content. Press Enter to send, Shift+Enter for a new line.
        </p>
        {contextSlug && (
          <div className="mt-3 text-xs text-muted-foreground">
            Context:{" "}
            <Link
              href={`/blog/${contextSlug}`}
              className="text-primary hover:underline"
            >
              {contextTitle || contextSlug}
            </Link>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatMessageList role="log" aria-live="polite" aria-label="Conversation with Lorenzo">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={message.sender === "user" ? undefined : "/images/portrait.webp"}
                fallback={message.sender === "user" ? "Y" : "LS"}
              />
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
              >
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {messages.length === 1 && !isLoading && (
            <div className="px-2 pt-2">
              <span className="label-mono mb-3 block">Try arguing</span>
              <div className="flex flex-col items-start gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="border border-border px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/45 hover:text-primary focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src="/images/portrait.webp"
                fallback="LS"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      <div className="p-4 border-t">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-xl border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            aria-label="Message"
            className="border-0 bg-transparent shadow-none focus:ring-0 focus-visible:ring-0"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="hidden md:inline-flex"
                disabled
                aria-label="Attachment disabled"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="hidden md:inline-flex"
                disabled
                aria-label="Voice input disabled"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
              disabled={isLoading}
              aria-label="Send message"
            >
              Send
              <CornerDownLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
