"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AskLorenzoDemo() {
  const [question, setQuestion] = useState("What kind of work do you do?");
  const [answer, setAnswer] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const ask = async () => {
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setError("");
    setAnswer("");
    setProvider("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Chat failed");
      setAnswer(json?.answer || "");
      setProvider(json?.provider || "");
    } catch {
      setError("Chat is unavailable right now.");
    } finally {
      setLoading(false);
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
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
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
          disabled={loading}
          className={cn(
            "cta-primary rounded-xl px-4 py-2 text-sm font-semibold inline-flex items-center gap-2",
            loading && "opacity-80"
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate answer
        </button>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {answer && (
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <div className="text-xs text-muted-foreground">
              Provider: <span className="font-mono">{provider || "unknown"}</span>
            </div>
            <p className="mt-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {answer}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

