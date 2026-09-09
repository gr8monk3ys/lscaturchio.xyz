"use client";

import { FormEvent, KeyboardEvent } from "react";
import { useAskConversation } from "@/hooks/use-ask-conversation";
import { CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/chat/chat-bubble";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import Link from "next/link";

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

  // The conversation itself lives in `useAskConversation`, shared with the ask
  // drawer. This route is now one of two presentations of the same thing.
  const { messages, input, setInput, isLoading, send, reset, isEmpty } =
    useAskConversation({ contextSlug, initialQuery });

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    void send(input);
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
        <div className="flex items-baseline justify-between gap-4">
          <span className="label-mono block">Ask the site</span>
          {/* A way out of a thread that went nowhere. The design review filed
              the absence of this as a user-control failure. */}
          {!isEmpty && (
            <button
              type="button"
              onClick={reset}
              className="label-mono text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Start over
            </button>
          )}
        </div>
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
                src={message.sender === "user" ? undefined : "/images/portrait-avatar.webp"}
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
                    onClick={() => void send(message.failedQuery ?? "")}
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
                    onClick={() => void send(prompt)}
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
                src="/images/portrait-avatar.webp"
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
