"use client";

import { useState } from "react";
import { inputClass, labelClass, fieldClass, submitButtonClass } from "./form-styles";
import { PublishResult, type PublishState } from "./publish-result";
import { publishRequest } from "./publish";
import { useUnsavedChangesWarning } from "./use-unsaved-changes";

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
  // Selected photos and their metadata exist only here until published.
  useUnsavedChangesWarning(drafts.length > 0 && result.state !== "done");

  function updateDraft(index: number, patch: Partial<PhotoDraft>) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  async function publish() {
    setResult({ state: "saving" });
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
    setResult(await publishRequest("/api/admin/photos", { method: "POST", body: form }, "/photos"));
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
          name="photos"
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
            <label className={fieldClass}>
              <span className={labelClass}>Category</span>
              <select
                name="category"
                autoComplete="off"
                className={inputClass}
                value={d.category}
                onChange={(e) =>
                  updateDraft(i, { category: e.target.value as PhotoDraft["category"] })
                }
              >
                <option value="travel">Travel & Landscape</option>
                <option value="nature">Nature</option>
              </select>
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Date</span>
              <input
                name="date"
                autoComplete="off"
                type="date"
                className={inputClass}
                value={d.date}
                onChange={(e) => updateDraft(i, { date: e.target.value })}
                required
              />
            </label>
          </div>
          <label className={fieldClass}>
            <span className={labelClass}>Alt text</span>
            <input
              name="alt-text"
              autoComplete="off"
              className={inputClass}
              value={d.alt}
              onChange={(e) => updateDraft(i, { alt: e.target.value })}
              required
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className={fieldClass}>
              <span className={labelClass}>Camera</span>
              <input
                name="camera"
                autoComplete="off"
                className={inputClass}
                value={d.camera}
                onChange={(e) => updateDraft(i, { camera: e.target.value })}
                required
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Lens</span>
              <input
                name="lens"
                autoComplete="off"
                className={inputClass}
                value={d.lens}
                onChange={(e) => updateDraft(i, { lens: e.target.value })}
                required
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Settings</span>
              <input
                name="settings"
                autoComplete="off"
                className={inputClass}
                placeholder="f/8 1/250 ISO 200"
                value={d.settings}
                onChange={(e) => updateDraft(i, { settings: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={fieldClass}>
              <span className={labelClass}>Recipe (optional)</span>
              <input
                name="recipe"
                autoComplete="off"
                className={inputClass}
                value={d.recipe}
                onChange={(e) => updateDraft(i, { recipe: e.target.value })}
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Location (optional)</span>
              <input
                name="location"
                autoComplete="off"
                className={inputClass}
                value={d.location}
                onChange={(e) => updateDraft(i, { location: e.target.value })}
              />
            </label>
          </div>
        </fieldset>
      ))}
      <button
        type="submit"
        disabled={drafts.length === 0 || result.state === "saving"}
        className={submitButtonClass}
      >
        Publish {drafts.length || ""} photo{drafts.length === 1 ? "" : "s"}
      </button>
      <PublishResult result={result} />
    </form>
  );
}
