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
        "label-mono tabular-nums",
        ok ? "text-primary" : "text-muted-foreground"
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
    <div className="border-y border-border py-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="label-mono">Live status</div>
          <div className="mt-2 text-sm text-muted-foreground">
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
        <div className="mt-4 border-l-2 border-destructive pl-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load status"}
        </div>
      ) : (
        <div className="mt-6 grid divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:border-t-0">
          <div className="py-5 sm:px-5 sm:py-0 sm:first:pl-0">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <Database className="size-4 text-muted-foreground" />
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

          <div className="py-5 sm:px-5 sm:py-0">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <BrainCircuit className="size-4 text-muted-foreground" />
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

          <div className="py-5 sm:px-5 sm:py-0">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="size-4 text-muted-foreground" />
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
