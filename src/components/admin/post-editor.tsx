"use client";

import { useState } from "react";
import { BLOG_STAGES } from "@/lib/blog-stage";
import { inputClass, labelClass, fieldClass } from "./form-styles";
import { PublishResult, type PublishState } from "./publish-result";

export interface PostEditorInitial {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  stage?: string;
  image?: string;
  body: string;
}

function slugifyClient(title: string): string {
  return title
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PostEditor({ initial }: { initial?: PostEditorInitial }) {
  const editing = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [series, setSeries] = useState(initial?.series ?? "");
  const [seriesOrder, setSeriesOrder] = useState(
    initial?.seriesOrder ? String(initial.seriesOrder) : ""
  );
  const [stage, setStage] = useState(initial?.stage ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [result, setResult] = useState<PublishState>({ state: "idle" });

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugifyClient(value));
  }

  function onCoverChange(file: File | undefined) {
    if (!file) {
      setCoverImage(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverImage(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function publish() {
    setResult({ state: "saving" });
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          date,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          series: series || undefined,
          seriesOrder: seriesOrder ? Number(seriesOrder) : undefined,
          stage: stage || undefined,
          image: initial?.image,
          body,
          coverImage: coverImage || undefined,
          overwrite: editing,
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { commitUrl: string; path: string };
      };
      if (!res.ok || !json.success || !json.data) {
        setResult({ state: "error", message: json.error || `Publish failed (${res.status})` });
        return;
      }
      setResult({ state: "done", commitUrl: json.data.commitUrl, viewPath: json.data.path });
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
      <div className={fieldClass}>
        <label className={labelClass} htmlFor="post-title">
          Title
        </label>
        <input
          id="post-title"
          className={inputClass}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>
      <div className={fieldClass}>
        <label className={labelClass} htmlFor="post-slug">
          Slug
        </label>
        <input
          id="post-slug"
          className={inputClass}
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          disabled={editing}
          required
        />
      </div>
      <div className={fieldClass}>
        <label className={labelClass} htmlFor="post-description">
          Description
        </label>
        <textarea
          id="post-description"
          className={inputClass}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="post-date">
            Date
          </label>
          <input
            id="post-date"
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="post-stage">
            Stage
          </label>
          <select
            id="post-stage"
            className={inputClass}
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            <option value="">(none)</option>
            {BLOG_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="post-tags">
            Tags (comma-separated)
          </label>
          <input
            id="post-tags"
            className={inputClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="post-series">
            Series
          </label>
          <input
            id="post-series"
            className={inputClass}
            value={series}
            onChange={(e) => setSeries(e.target.value)}
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="post-series-order">
            Series order
          </label>
          <input
            id="post-series-order"
            type="number"
            min={1}
            className={inputClass}
            value={seriesOrder}
            onChange={(e) => setSeriesOrder(e.target.value)}
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="post-cover">
            Cover image {initial?.image ? "(replaces current)" : ""}
          </label>
          <input
            id="post-cover"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className={inputClass}
            onChange={(e) => onCoverChange(e.target.files?.[0])}
          />
        </div>
      </div>
      <div className={fieldClass}>
        <label className={labelClass} htmlFor="post-body">
          Body (Markdown/MDX)
        </label>
        <textarea
          id="post-body"
          className={`${inputClass} font-mono`}
          rows={24}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={result.state === "saving"}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {editing ? "Publish update" : "Publish post"}
      </button>
      <PublishResult result={result} />
    </form>
  );
}
