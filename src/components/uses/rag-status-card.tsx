"use client";

import { BrainCircuit, Database, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";

type RagStatus = {
  timestamp: string;
  database: { configured: boolean; ok: boolean };
  embeddings: { provider: string; available: boolean; dimensions: number; count: number | null };
  chat: { openaiConfigured: boolean; ollamaAvailable: boolean | null };
};

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums",
        ok
          ? "border-success/30 bg-success/10 text-success"
          : "border-warning/30 bg-warning/10 text-warning"
      )}
    >
      {label}
    </span>
  );
}

export function RagStatusCard() {
  const { data: status, error } = useSWR<RagStatus>("/api/rag-status", fetchJson, {
    revalidateOnFocus: false,
  });

  return (
    <div className="neu-card rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Live status</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Health of the stack behind embeddings, search, and chat.
          </div>
        </div>
        {status ? (
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {new Date(status.timestamp).toLocaleString()}
          </div>
        ) : (
          <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" aria-hidden />
        )}
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load status"}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <Database className="size-4 text-primary" />
                Database
              </div>
              <Pill ok={!!status?.database.ok} label={status?.database.ok ? "OK" : status?.database.configured ? "Error" : "Off"} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {status
                ? status.database.configured
                  ? "Neon Postgres reachable."
                  : "DATABASE_URL not set."
                : "Loading…"}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <BrainCircuit className="size-4 text-primary" />
                Embeddings
              </div>
              <Pill ok={!!status?.embeddings.available} label={status?.embeddings.available ? "Ready" : "Offline"} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {status ? (
                <div className="space-y-1">
                  <div className="tabular-nums">
                    Provider: <span className="font-semibold text-foreground/80">{status.embeddings.provider}</span>
                  </div>
                  <div className="tabular-nums">
                    Dimensions: <span className="font-semibold text-foreground/80">{status.embeddings.dimensions}</span>
                  </div>
                  <div className="tabular-nums">
                    Stored:{" "}
                    <span className="font-semibold text-foreground/80">
                      {status.embeddings.count === null ? "unknown" : status.embeddings.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                "Loading…"
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="size-4 text-primary" />
                Chat
              </div>
              <Pill
                ok={!!status?.chat.openaiConfigured || !!status?.chat.ollamaAvailable}
                label={
                  status
                    ? status.chat.openaiConfigured
                      ? "OpenAI"
                      : status.chat.ollamaAvailable
                        ? "Ollama"
                        : "Offline"
                    : "…"
                }
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {status ? (
                status.chat.openaiConfigured
                  ? "OpenAI configured."
                  : status.chat.ollamaAvailable
                    ? "Ollama reachable."
                    : "No provider configured."
              ) : (
                "Loading…"
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
