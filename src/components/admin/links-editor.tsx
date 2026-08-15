"use client";

import { useState } from "react";
import type { LinksContent, LinkData } from "@/types/links";
import { inputClass, labelClass, fieldClass } from "./form-styles";
import { PublishResult, type PublishState } from "./publish-result";

const EMPTY_LINK: LinkData = { title: "", link: "", linkDescription: "" };

export function LinksEditor({ initial }: { initial: LinksContent }) {
  const [content, setContent] = useState<LinksContent>(initial);
  const [result, setResult] = useState<PublishState>({ state: "idle" });

  function updateLink(sectionKey: string, index: number, patch: Partial<LinkData>) {
    setContent((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        links: prev[sectionKey].links.map((l, i) => (i === index ? { ...l, ...patch } : l)),
      },
    }));
  }

  function setLinks(sectionKey: string, links: LinkData[]) {
    setContent((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], links } }));
  }

  async function publish() {
    setResult({ state: "saving" });
    try {
      const cleaned: LinksContent = Object.fromEntries(
        Object.entries(content).map(([key, section]) => [
          key,
          {
            ...section,
            links: section.links.map((l) => ({ ...l, rss: l.rss || undefined })),
          },
        ])
      );
      const res = await fetch("/api/admin/data/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { commitUrl: string };
      };
      if (!res.ok || !json.success || !json.data) {
        setResult({ state: "error", message: json.error || `Publish failed (${res.status})` });
        return;
      }
      setResult({ state: "done", commitUrl: json.data.commitUrl, viewPath: "/links" });
    } catch (error) {
      setResult({
        state: "error",
        message: error instanceof Error ? error.message : "Publish failed",
      });
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void publish();
      }}
    >
      {Object.entries(content).map(([key, section]) => (
        <section key={key} className="mb-8">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <p className="mb-3 text-sm text-muted-foreground">{section.description}</p>
          {section.links.map((l, i) => (
            <fieldset key={i} className="mb-3 rounded-md border border-border p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className={fieldClass}>
                  <label className={labelClass}>Title</label>
                  <input
                    className={inputClass}
                    value={l.title}
                    onChange={(e) => updateLink(key, i, { title: e.target.value })}
                    required
                  />
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>URL</label>
                  <input
                    type="url"
                    className={inputClass}
                    value={l.link}
                    onChange={(e) => updateLink(key, i, { link: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className={fieldClass}>
                  <label className={labelClass}>Description</label>
                  <input
                    className={inputClass}
                    value={l.linkDescription}
                    onChange={(e) => updateLink(key, i, { linkDescription: e.target.value })}
                    required
                  />
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>RSS (optional)</label>
                  <input
                    className={inputClass}
                    value={l.rss ?? ""}
                    onChange={(e) => updateLink(key, i, { rss: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="button"
                className="text-sm text-muted-foreground underline"
                onClick={() => setLinks(key, section.links.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </fieldset>
          ))}
          <button
            type="button"
            className="text-sm underline"
            onClick={() => setLinks(key, [...section.links, { ...EMPTY_LINK }])}
          >
            + Add link to {section.title}
          </button>
        </section>
      ))}
      <button
        type="submit"
        disabled={result.state === "saving"}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        Publish /links update
      </button>
      <PublishResult result={result} />
    </form>
  );
}
