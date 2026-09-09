"use client";

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { RotateCcw, X, ArrowUp } from "lucide-react";

import { useAskConversation } from "@/hooks/use-ask-conversation";
import { useAskDrawer } from "@/components/chat/ask-drawer-provider";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/chat/chat-bubble";
import { ChatMessageList } from "@/components/chat/chat-message-list";

/**
 * Wall-label links rather than chips. The suggestions are the same register as
 * a footer link or a date: mono, normal case, underline on hover.
 */
const SUGGESTIONS = [
  "What's your most contrarian take?",
  "Argue with me: isn't meritocracy basically fair?",
  "What have you changed your mind about?",
];

/** `/blog/<slug>` grounds answers in the essay being read; nothing else does. */
function essaySlugFrom(pathname: string | null): string {
  if (!pathname) return "";
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/);
  return match ? match[1] : "";
}

export function AskDrawer() {
  const drawer = useAskDrawer();
  const pathname = usePathname();
  const contextSlug = essaySlugFrom(pathname);

  const { messages, input, setInput, isLoading, send, reset, isEmpty } =
    useAskConversation({ contextSlug });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const isOpen = drawer?.isOpen ?? false;
  const isOverlay = drawer?.isOverlay ?? true;
  const seed = drawer?.seed ?? "";
  const clearSeed = drawer?.clearSeed;

  // A question handed in by whatever opened the drawer lands in the composer
  // rather than sending itself. The reader gets to edit it first.
  useEffect(() => {
    if (!isOpen || !seed) return;
    setInput(seed);
    clearSeed?.();
  }, [isOpen, seed, setInput, clearSeed]);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [isOpen]);

  // Trap focus only while the drawer covers the page. In push mode it sits
  // beside fully usable content and trapping would strand the reader; in
  // overlay mode the panel is modal, and without this Tab walked straight out
  // of it into content hidden behind the scrim.
  useEffect(() => {
    if (!isOpen || !isOverlay) return;
    const panel = panelRef.current;
    if (!panel) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, isOverlay]);

  if (!drawer) return null;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    void send(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <>
      {/* Dismiss by tapping outside, the affordance a covering panel implies. */}
      <div
        className="ask-scrim"
        aria-hidden
        onClick={drawer.close}
      />

    <aside
      id="ask-drawer"
      ref={panelRef}
      aria-label="Ask this site"
      aria-hidden={!isOpen}
      role={isOverlay ? "dialog" : undefined}
      aria-modal={isOverlay && isOpen ? true : undefined}
      // No shadow: the Two Sheets Rule spends both of its elevated objects
      // already. The drawer separates from the page with a hairline, the way
      // every other surface here does.
      className={[
        "ask-drawer fixed inset-y-0 z-[55] flex w-full flex-col border-border bg-background",
        "border-s md:w-96",
        isOpen ? "translate-x-0" : "translate-x-full",
        isOpen ? "visible" : "invisible",
      ].join(" ")}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <span className="label-mono">Ask</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={reset}
            disabled={isEmpty}
            aria-label="Start a new conversation"
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={drawer.close}
            aria-label="Close the ask panel"
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>

      {isEmpty ? (
        <div className="flex-1 overflow-y-auto px-5 py-8">
          <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Ask the essays anything.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Answers come from what is published here, quoted where they can be.
            {contextSlug ? " Right now it will read this essay first." : ""}
          </p>

          <ul className="mt-8 space-y-3">
            {SUGGESTIONS.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => void send(question)}
                  className="label-mono label-link group items-start gap-2 text-start normal-case tracking-normal text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span aria-hidden className="text-muted-foreground group-hover:text-primary">
                    ↳
                  </span>
                  <span className="underline-offset-4 group-hover:underline">{question}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.sender === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={
                    message.sender === "user" ? undefined : "/images/portrait-avatar.webp"
                  }
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
                      className="label-mono label-link mt-3 text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      Try again →
                    </button>
                  )}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

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
      )}

      {/* The masthead's underline field, at drawer scale: a rule on the paper
          rather than a box floating on it. */}
      <form onSubmit={submit} className="border-t border-border p-4">
        <div className="flex items-end gap-2 border-b border-border focus-within:border-primary">
          <label htmlFor="ask-drawer-input" className="sr-only">
            Ask a question
          </label>
          <textarea
            id="ask-drawer-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about the writing…"
            /* The underline is the field, so the focus ring is the underline
               turning Forest Ink (see focus-within on the wrapper). The element
               itself previously had `focus:outline-hidden` and nothing else,
               which left it with no visible focused state at all. */
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send question"
            className="mb-1 inline-flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </form>
    </aside>
    </>
  );
}
