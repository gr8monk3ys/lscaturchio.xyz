"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logError } from "@/lib/logger";

/**
 * One conversation with the site, wherever it is being held.
 *
 * The /chat route and the ask drawer are two presentations of the same thing.
 * Before this hook the route owned the only copy of the send/retry/error logic,
 * so a second surface meant either duplicating it or shipping a second surface
 * that could only link to the first. That is what the essay sidebar did: its
 * "Ask" panel was a form that navigated you to /chat, away from the essay you
 * were reading, which the design review filed as a user-control failure.
 *
 * The interface is deliberately small — what to render, and three things you
 * can do — so a caller never has to know how a turn is assembled.
 */

export interface AskMessage {
  id: number;
  content: string;
  sender: "user" | "ai";
  /** Set on a failed turn so the reader can resend the question that failed. */
  failedQuery?: string;
}

/**
 * Honest about the mechanism: this is retrieval over the essays, not a model
 * trained on them. The site's one rule is that nothing on it claims more than
 * it can show.
 */
export const ASK_OPENER =
  "I answer from Lorenzo's essays and the notes on this site, in his words where I can find them. Ask what he thinks. Or push back and argue.";

const ERROR_COPY =
  "That one didn't get through. The essays are still here; try the question again, or ask it another way.";

function openingMessage(): AskMessage {
  return { id: 1, content: ASK_OPENER, sender: "ai" };
}

export interface UseAskConversationOptions {
  /** Essay slug to ground answers in, when the reader is on one. */
  contextSlug?: string;
  /** Prefill the composer without sending. */
  initialQuery?: string;
}

export function useAskConversation({
  contextSlug = "",
  initialQuery = "",
}: UseAskConversationOptions = {}) {
  const [messages, setMessages] = useState<AskMessage[]>(() => [openingMessage()]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Held in a ref so `send` stays referentially stable while still reading the
  // slug of whatever page the reader has navigated to since the drawer opened.
  const contextRef = useRef(contextSlug);
  useEffect(() => {
    contextRef.current = contextSlug;
  }, [contextSlug]);

  useEffect(() => {
    if (!initialQuery) return;
    setInput((prev) => (prev.trim().length > 0 ? prev : initialQuery));
  }, [initialQuery]);

  const send = useCallback(
    async (raw: string) => {
      const query = raw.trim();
      if (!query) return;
      // Read through a setter rather than closing over `isLoading`, so a caller
      // firing two sends in the same tick cannot open two requests.
      let busy = false;
      setIsLoading((current) => {
        busy = current;
        return current;
      });
      if (busy) return;

      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, content: query, sender: "user" },
      ]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            contextSlug: contextRef.current || undefined,
          }),
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
        if (!answer) throw new Error("Chat response missing answer");

        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, content: answer, sender: "ai" },
        ]);
      } catch (error) {
        logError("Chat request failed", error, {
          component: "useAskConversation",
          action: "send",
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
    },
    []
  );

  /** Back to the opening line. Heuristic 3 wanted an exit from a bad thread. */
  const reset = useCallback(() => {
    setMessages([openingMessage()]);
    setInput("");
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    send,
    reset,
    /** True while the conversation is still just the opener. */
    isEmpty: messages.length <= 1,
  };
}
