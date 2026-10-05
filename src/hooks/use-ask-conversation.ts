"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitWrite, type WriteResult } from "@/lib/fetcher";
import { logError, logWarn } from "@/lib/logger";

/**
 * The reader sees ERROR_COPY whatever went wrong; this decides who else hears.
 * A declined request — rate limit, CSRF origin, validation — is the server
 * working as intended, so it is a warning. A 5xx, a lost request, or a 200
 * with no answer in it is something to fix.
 */
function logFailure(result: WriteResult<unknown>): void {
  const context = { component: "useAskConversation", action: "send" };
  switch (result.kind) {
    case "invalid-field":
    case "rate-limited":
    case "refused":
      logWarn("Chat request rejected", { ...context, kind: result.kind, reason: result.message });
      return;
    case "server-error":
      logError("Chat request failed", new Error(result.message ?? `status ${result.status}`), context);
      return;
    case "network":
      logError("Chat request failed", new Error(`network: ${result.cause}`), context);
      return;
    case "ok":
      logError("Chat request failed", new Error("Chat response missing answer"), context);
      return;
  }
}

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

      const result = await submitWrite<{ answer?: unknown }>(
        "/api/chat",
        { query, contextSlug: contextRef.current || undefined },
        // A model-backed answer can legitimately outlast the forms' 20s: the
        // provider client alone allows 30s and one retry (src/lib/ai-provider.ts).
        { timeoutMs: null }
      );
      setIsLoading(false);

      const answer =
        result.kind === "ok" &&
        typeof result.data?.answer === "string" &&
        result.data.answer.trim().length > 0
          ? result.data.answer
          : null;

      if (answer) {
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, content: answer, sender: "ai" },
        ]);
        return;
      }

      logFailure(result);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: ERROR_COPY,
          sender: "ai",
          failedQuery: query,
        },
      ]);
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
