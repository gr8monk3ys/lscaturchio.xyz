"use client";

import { useReducer } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AskState {
  question: string;
  answer: string;
  provider: string;
  loading: boolean;
  error: string;
}

type AskAction =
  | { type: "setQuestion"; value: string }
  | { type: "askStart" }
  | { type: "askSuccess"; answer: string; provider: string }
  | { type: "askError"; message: string };

const initialState: AskState = {
  question: "What kind of work do you do?",
  answer: "",
  provider: "",
  loading: false,
  error: "",
};

function askReducer(state: AskState, action: AskAction): AskState {
  switch (action.type) {
    case "setQuestion":
      return { ...state, question: action.value };
    case "askStart":
      return {
        ...state,
        loading: true,
        error: "",
        answer: "",
        provider: "",
      };
    case "askSuccess":
      return {
        ...state,
        loading: false,
        answer: action.answer,
        provider: action.provider,
      };
    case "askError":
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
}

export function AskLorenzoDemo() {
  const [state, dispatch] = useReducer(askReducer, initialState);

  const ask = async () => {
    const q = state.question.trim();
    if (!q || state.loading) return;
    dispatch({ type: "askStart" });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Chat failed");
      const payload = json?.data ?? json;
      dispatch({
        type: "askSuccess",
        answer: payload?.answer || "",
        provider: payload?.provider || "",
      });
    } catch {
      dispatch({ type: "askError", message: "Chat is unavailable right now." });
    }
  };

  return (
    <section className="neu-card p-6">
      <h3 className="text-xl font-semibold">Ask Lorenzo (RAG)</h3>
      <p className="text-sm text-muted-foreground mt-1">
        This calls the live chat endpoint. It may use OpenAI or a local model depending on your deployment config.
      </p>

      <div className="mt-5 space-y-3">
        <textarea
          value={state.question}
          onChange={(e) => dispatch({ type: "setQuestion", value: e.target.value })}
          rows={3}
          className={cn(
            "w-full rounded-xl px-3 py-2 text-sm",
            "neu-input text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary"
          )}
        />

        <button
          type="button"
          onClick={ask}
          disabled={state.loading}
          className={cn(
            "cta-primary rounded-xl px-4 py-2 text-sm font-semibold inline-flex items-center gap-2",
            state.loading && "opacity-80"
          )}
        >
          {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate answer
        </button>

        {state.error && <div className="text-sm text-red-600">{state.error}</div>}

        {state.answer && (
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <div className="text-xs text-muted-foreground">
              Provider: <span className="font-mono">{state.provider || "unknown"}</span>
            </div>
            <p className="mt-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {state.answer}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
