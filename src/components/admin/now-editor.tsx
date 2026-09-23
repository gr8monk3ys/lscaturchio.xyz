"use client";

import { useState } from "react";
import type { NowContent, NowBuild } from "@/lib/admin/schemas";
import { inputClass, labelClass, fieldClass, submitButtonClass } from "./form-styles";
import { PublishResult, type PublishState } from "./publish-result";
import { publishRequest } from "./publish";
import { useUnsavedChangesWarning } from "./use-unsaved-changes";

export function NowEditor({ initial }: { initial: NowContent }) {
  const [location, setLocation] = useState(initial.location);
  const [building, setBuilding] = useState<NowBuild[]>(initial.building);
  const [thinkingAbout, setThinkingAbout] = useState<string[]>(initial.thinkingAbout);
  const [result, setResult] = useState<PublishState>({ state: "idle" });
  // Typing is caught by the form's onChange; add/remove buttons mark it too.
  const [dirty, setDirty] = useState(false);
  useUnsavedChangesWarning(dirty);

  function updateBuild(index: number, patch: Partial<NowBuild>) {
    setBuilding((prev) => prev.map((x, j) => (j === index ? { ...x, ...patch } : x)));
  }

  async function publish() {
    setResult({ state: "saving" });
    const published = await publishRequest(
      "/api/admin/data/now",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastUpdated: new Date().toISOString().slice(0, 10),
          location,
          building,
          thinkingAbout,
        }),
      },
      "/now"
    );
    setResult(published);
    if (published.state === "done") setDirty(false);
  }

  return (
    <form
      onChange={() => setDirty(true)}
      onSubmit={(e) => {
        e.preventDefault();
        void publish();
      }}
    >
      <h2 className="text-subsection mb-2">Location</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={fieldClass}>
          <span className={labelClass}>Label</span>
          <input
            name="label"
            autoComplete="off"
            className={inputClass}
            value={location.label}
            onChange={(e) => {
              const { value } = e.target;
              setLocation((prev) => ({ ...prev, label: value }));
            }}
            required
          />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Detail</span>
          <input
            name="detail"
            autoComplete="off"
            className={inputClass}
            value={location.detail}
            onChange={(e) => {
              const { value } = e.target;
              setLocation((prev) => ({ ...prev, detail: value }));
            }}
            required
          />
        </label>
      </div>

      <h2 className="text-subsection mb-2 mt-6">Building</h2>
      {building.map((b, i) => (
        <fieldset key={i} className="mb-4 rounded-md border border-border p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={fieldClass}>
              <span className={labelClass}>Title</span>
              <input
                name="title"
                autoComplete="off"
                className={inputClass}
                value={b.title}
                onChange={(e) => updateBuild(i, { title: e.target.value })}
                required
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Link</span>
              <input
                name="link"
                autoComplete="off"
                className={inputClass}
                value={b.href}
                onChange={(e) => updateBuild(i, { href: e.target.value })}
                required
              />
            </label>
          </div>
          <label className={fieldClass}>
            <span className={labelClass}>Note</span>
            <textarea
              name="note"
              autoComplete="off"
              className={inputClass}
              rows={2}
              value={b.note}
              onChange={(e) => updateBuild(i, { note: e.target.value })}
              required
            />
          </label>
          <button
            type="button"
            className="text-sm text-muted-foreground underline"
            onClick={() => {
              setDirty(true);
              setBuilding((prev) => prev.filter((_, j) => j !== i));
            }}
          >
            Remove
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="mb-6 text-sm underline"
        onClick={() => {
          setDirty(true);
          setBuilding((prev) => [...prev, { title: "", href: "", note: "" }]);
        }}
      >
        + Add project
      </button>

      <h2 className="text-subsection mb-2">Thinking about</h2>
      {thinkingAbout.map((t, i) => (
        <div key={i} className="mb-2 flex gap-2">
          <textarea
            className={inputClass}
            rows={2}
            value={t}
            onChange={(e) => {
              const { value } = e.target;
              setThinkingAbout((prev) => prev.map((x, j) => (j === i ? value : x)));
            }}
            required
          />
          <button
            type="button"
            className="text-sm text-muted-foreground underline"
            onClick={() => {
              setDirty(true);
              setThinkingAbout((prev) => prev.filter((_, j) => j !== i));
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="mb-6 block text-sm underline"
        onClick={() => {
          setDirty(true);
          setThinkingAbout((prev) => [...prev, ""]);
        }}
      >
        + Add thought
      </button>

      <button type="submit" disabled={result.state === "saving"} className={submitButtonClass}>
        Publish /now update
      </button>
      <p className="mt-2 text-xs text-muted-foreground">
        The &ldquo;last updated&rdquo; date is set to today automatically.
      </p>
      <PublishResult result={result} />
    </form>
  );
}
