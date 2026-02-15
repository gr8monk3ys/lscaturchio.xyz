"use client";

import { useEffect, useMemo, useState, FormEvent, KeyboardEvent } from "react";
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
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface ChatMessage {
  id: number;
  content: string;
  sender: "user" | "ai";
}

export function ChatPageClient() {
  const searchParams = useSearchParams();
  const contextSlug = useMemo(() => searchParams.get("contextSlug") || "", [searchParams]);
  const contextTitle = useMemo(() => searchParams.get("contextTitle") || "", [searchParams]);
  const initialQuery = useMemo(() => searchParams.get("q") || "", [searchParams]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      content: "Hi! I'm Lorenzo. Ask me anything about my work, projects, or writing.",
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

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const query = input.trim();
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

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: data.answer ?? "I couldn't generate a response.",
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
