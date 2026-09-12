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

  a.forEach((v) => {
    normA += v * v;
  });
  b.forEach((v) => {
    normB += v * v;
  });
  if (normA === 0 || normB === 0) return 0;

  // Iterate smaller map for dot product.
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  small.forEach((v, k) => {
    const w = large.get(k) ?? 0;
    dot += v * w;
  });

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function ToySimilarity() {
  /**
   * Defaults that the demo can actually score.
   *
   * These were "RAG systems ground answers in retrieved sources." and
   * "Semantic search uses embeddings to find relevant context." — two
   * sentences a reader recognises as being about the same thing, which share
   * no content words and therefore scored **0%** on a word-frequency metric.
   * The page opened by presenting a related pair and reporting no relation, on
   * a demo whose stated purpose is to "explain why retrieval works".
   *
   * These overlap heavily, so the number means something on arrival. The
   * limitation is still the interesting part, so the copy now invites the
   * reader to produce it deliberately instead of shipping it as the default.
   */
  const [a, setA] = useState("Retrieval works because similar documents share words.");
  const [b, setB] = useState("Documents that share words are similar, which is why retrieval works.");

  const { score, overlap } = useMemo(() => {
    const ta = tokenize(a);
    const tb = tokenize(b);
    const va = buildVector(ta);
    const vb = buildVector(tb);
    const s = cosineSimilarity(va, vb);

    const shared = new Set<string>();
    va.forEach((_v, k) => {
      if (vb.has(k)) shared.add(k);
    });
    const overlapTokens = Array.from(shared).slice(0, 16);

    return { score: s, overlap: overlapTokens };
  }, [a, b]);

  const pct = Math.round(score * 100);

  return (
    <section className="border border-border p-6">
      <h3 className="text-card-title">Toy text similarity</h3>
      {/* `max-w-prose`, per the Measure Rule. */}
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        A tiny cosine-similarity demo, scored on word frequency rather than on
        embeddings. Reword one of these to mean the same thing without reusing
        its words and the score collapses — that gap is the whole reason
        retrieval uses embeddings instead of this.
      </p>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="toy-similarity-text-a" className="block text-xs font-medium text-muted-foreground mb-2">
            Text A
          </label>
          <textarea
            id="toy-similarity-text-a"
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={5}
            className={cn(
              "w-full rounded-xl px-3 py-2 text-sm",
              "neu-input text-foreground placeholder:text-muted-foreground"
            )}
          />
        </div>
        <div>
          <label htmlFor="toy-similarity-text-b" className="block text-xs font-medium text-muted-foreground mb-2">
            Text B
          </label>
          <textarea
            id="toy-similarity-text-b"
            value={b}
            onChange={(e) => setB(e.target.value)}
            rows={5}
            className={cn(
              "w-full rounded-xl px-3 py-2 text-sm",
              "neu-input text-foreground placeholder:text-muted-foreground"
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
