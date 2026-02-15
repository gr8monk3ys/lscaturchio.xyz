"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2000);
}

function buildVector(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) {
    m.set(t, (m.get(t) ?? 0) + 1);
  }
  return m;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [, v] of a) normA += v * v;
  for (const [, v] of b) normB += v * v;
  if (normA === 0 || normB === 0) return 0;

  // Iterate smaller map for dot product.
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const [k, v] of small) {
    const w = large.get(k) ?? 0;
    dot += v * w;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function ToySimilarity() {
  const [a, setA] = useState("RAG systems ground answers in retrieved sources.");
  const [b, setB] = useState("Semantic search uses embeddings to find relevant context.");

  const { score, overlap } = useMemo(() => {
    const ta = tokenize(a);
    const tb = tokenize(b);
    const va = buildVector(ta);
    const vb = buildVector(tb);
    const s = cosineSimilarity(va, vb);

    const shared = new Set<string>();
    for (const k of va.keys()) {
      if (vb.has(k)) shared.add(k);
    }
    const overlapTokens = Array.from(shared).slice(0, 16);

    return { score: s, overlap: overlapTokens };
  }, [a, b]);

  const pct = Math.round(score * 100);

  return (
    <section className="neu-card p-6">
      <h3 className="text-xl font-semibold">Toy Text Similarity</h3>
      <p className="text-sm text-muted-foreground mt-1">
        A tiny cosine-similarity demo (word-frequency based). This is not embeddings, but it helps explain
        why retrieval works.
      </p>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Text A
          </label>
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={5}
            className={cn(
              "w-full rounded-xl px-3 py-2 text-sm",
              "neu-input text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary"
            )}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Text B
          </label>
          <textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            rows={5}
            className={cn(
              "w-full rounded-xl px-3 py-2 text-sm",
              "neu-input text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary"
            )}
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-sm text-muted-foreground">Similarity</div>
          <div className="text-2xl font-bold tabular-nums">{pct}%</div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        {overlap.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            Shared tokens: {overlap.join(", ")}
          </div>
        )}
      </div>
    </section>
  );
}

