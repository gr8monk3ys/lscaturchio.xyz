"use client";

import { useState } from "react";
import { inputClass, labelClass, fieldClass } from "./form-styles";
import { PublishResult, type PublishState } from "./publish-result";

interface PhotoDraft {
  file: File;
  category: "travel" | "nature";
  alt: string;
  camera: string;
  lens: string;
  settings: string;
  recipe: string;
  location: string;
  date: string;
}

function draftFromFile(file: File): PhotoDraft {
  return {
    file,
    category: "travel",
    alt: "",
    camera: "",
    lens: "",
    settings: "",
    recipe: "",
    location: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

export function PhotosUploader() {
  const [drafts, setDrafts] = useState<PhotoDraft[]>([]);
  const [result, setResult] = useState<PublishState>({ state: "idle" });

  function updateDraft(index: number, patch: Partial<PhotoDraft>) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  async function publish() {
    setResult({ state: "saving" });
    try {
      const form = new FormData();
      form.append(
        "entries",
        JSON.stringify(
          drafts.map((d) => ({
            filename: d.file.name,
            category: d.category,
            alt: d.alt,
            camera: d.camera,
            lens: d.lens,
            settings: d.settings,
            recipe: d.recipe || undefined,
            location: d.location || undefined,
            date: d.date,
          }))
        )
      );
      for (const d of drafts) form.append("files", d.file);
      const res = await fetch("/api/admin/photos", { method: "POST", body: form });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { commitUrl: string };
      };
      if (!res.ok || !json.success || !json.data) {
        setResult({ state: "error", message: json.error || `Publish failed (${res.status})` });
        return;
      }
      setResult({ state: "done", commitUrl: json.data.commitUrl, viewPath: "/photos" });
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
        <label className={labelClass} htmlFor="photo-files">
          Photos
        </label>
        <input
          id="photo-files"
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className={inputClass}
          onChange={(e) => setDrafts(Array.from(e.target.files ?? []).map(draftFromFile))}
        />
      </div>
      {drafts.map((d, i) => (
        <fieldset key={`${d.file.name}-${i}`} className="mb-6 rounded-md border border-border p-4">
          <legend className="px-1 text-sm font-medium">{d.file.name}</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={fieldClass}>
              <label className={labelClass}>Category</label>
              <select
                className={inputClass}
                value={d.category}
                onChange={(e) =>
                  updateDraft(i, { category: e.target.value as PhotoDraft["category"] })
                }
              >
                <option value="travel">Travel & Landscape</option>
                <option value="nature">Nature</option>
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                className={inputClass}
                value={d.date}
                onChange={(e) => updateDraft(i, { date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Alt text</label>
            <input
              className={inputClass}
              value={d.alt}
              onChange={(e) => updateDraft(i, { alt: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className={fieldClass}>
              <label className={labelClass}>Camera</label>
              <input
                className={inputClass}
                value={d.camera}
                onChange={(e) => updateDraft(i, { camera: e.target.value })}
                required
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Lens</label>
              <input
                className={inputClass}
                value={d.lens}
                onChange={(e) => updateDraft(i, { lens: e.target.value })}
                required
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Settings</label>
              <input
                className={inputClass}
                placeholder="f/8 1/250 ISO 200"
                value={d.settings}
                onChange={(e) => updateDraft(i, { settings: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={fieldClass}>
              <label className={labelClass}>Recipe (optional)</label>
              <input
                className={inputClass}
                value={d.recipe}
                onChange={(e) => updateDraft(i, { recipe: e.target.value })}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Location (optional)</label>
              <input
                className={inputClass}
                value={d.location}
                onChange={(e) => updateDraft(i, { location: e.target.value })}
              />
            </div>
          </div>
        </fieldset>
      ))}
      <button
        type="submit"
        disabled={drafts.length === 0 || result.state === "saving"}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        Publish {drafts.length || ""} photo{drafts.length === 1 ? "" : "s"}
      </button>
      <PublishResult result={result} />
    </form>
  );
}
