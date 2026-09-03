"use client";

import { useEffect, useState, FormEvent, KeyboardEvent } from "react";
import { CornerDownLeft } from "lucide-react";
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
  /** Set on a failed turn so the reader can resend the question that failed. */
  failedQuery?: string;
}

// POV-forward openers — the chat is an interactive version of Lorenzo's
// thinking, not a search box. Lead with provocation, not "how can I help".
const STARTER_PROMPTS = [
  "What's your most contrarian take?",
  "Argue with me: isn't meritocracy basically fair?",
  "What did you used to believe that you've since changed your mind on?",
  "Pick a fight with Silicon Valley for me.",
];

// Honest about the mechanism: this is retrieval over the essays, not a
// model trained on them. The site's one rule is that nothing on it claims
// more than it can show.
const OPENER =
  "I answer from Lorenzo's essays and the notes on this site, in his words where I can find them. Ask what he thinks. Or push back and argue.";

const ERROR_COPY =
  "That one didn't get through. The essays are still here; try the question again, or ask it another way.";

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
    { id: 1, content: OPENER, sender: "ai" },
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
          content: ERROR_COPY,
          sender: "ai",
          failedQuery: query,
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
    <div className="flex min-h-[70vh] flex-col border-y border-border">
      <div className="px-1 py-5">
        <span className="label-mono block">Ask the site</span>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">Chat with Lorenzo</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Answers come from the essays, not from a model that made them up. Enter sends;
          Shift+Enter starts a new line.
        </p>
        {contextSlug && (
          <p className="label-mono mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Reading</span>
            <Link
              href={`/blog/${contextSlug}`}
              className="normal-case tracking-normal text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {contextTitle || contextSlug}
            </Link>
            <span aria-hidden className="text-foreground/25">·</span>
            <Link
              href={`/blog/${contextSlug}`}
              className="normal-case tracking-normal text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              ← Back to the essay
            </Link>
          </p>
        )}
      </div>

      <div className="flex-1 overflow-hidden border-t border-border">
        <ChatMessageList role="log" aria-live="polite" aria-label="Conversation with Lorenzo">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={message.sender === "user" ? undefined : "/images/portrait.webp"}
                alt="Lorenzo"
                fallback={message.sender === "user" ? "Y" : "LS"}
              />
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
              >
                {message.content}
                {message.failedQuery && !isLoading && (
                  <button
                    type="button"
                    onClick={() => void sendMessage(message.failedQuery ?? "")}
                    className="label-mono mt-3 block text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Try again →
                  </button>
                )}
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
                alt="Lorenzo"
                fallback="LS"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      <div className="border-t border-border py-4">
        <form
          onSubmit={handleSubmit}
          className="relative border-b border-border focus-within:border-primary"
        >
          <label htmlFor="chat-message" className="sr-only">Message</label>
          <ChatInput
            id="chat-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask, or argue…"
            aria-label="Message"
            className="border-0 bg-transparent px-0 shadow-none focus:ring-0 focus-visible:ring-0"
          />
          <div className="flex items-center justify-between gap-3 pb-3">
            {isLoading ? (
              <span className="label-mono normal-case tracking-normal" aria-live="polite">
                Reading the essays…
              </span>
            ) : (
              <span className="label-mono normal-case tracking-normal">Enter to send</span>
            )}
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="gap-1.5 rounded-full"
              disabled={isLoading}
              aria-label="Send message"
            >
              Send
              <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
