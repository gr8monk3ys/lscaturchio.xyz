"use client";

import { useState } from "react";
import type { NowContent, NowBuild } from "@/lib/now-data";
import { inputClass, labelClass, fieldClass } from "./form-styles";
import { PublishResult, type PublishState } from "./publish-result";

export function NowEditor({ initial }: { initial: NowContent }) {
  const [location, setLocation] = useState(initial.location);
  const [building, setBuilding] = useState<NowBuild[]>(initial.building);
  const [thinkingAbout, setThinkingAbout] = useState<string[]>(initial.thinkingAbout);
  const [result, setResult] = useState<PublishState>({ state: "idle" });

  async function publish() {
    setResult({ state: "saving" });
    try {
      const res = await fetch("/api/admin/data/now", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastUpdated: new Date().toISOString().slice(0, 10),
          location,
          building,
          thinkingAbout,
        }),
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
      setResult({ state: "done", commitUrl: json.data.commitUrl, viewPath: "/now" });
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
      <h2 className="mb-2 text-lg font-semibold">Location</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={fieldClass}>
          <label className={labelClass}>Label</label>
          <input
            className={inputClass}
            value={location.label}
            onChange={(e) => setLocation({ ...location, label: e.target.value })}
            required
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Detail</label>
          <input
            className={inputClass}
            value={location.detail}
            onChange={(e) => setLocation({ ...location, detail: e.target.value })}
            required
          />
        </div>
      </div>

      <h2 className="mb-2 mt-6 text-lg font-semibold">Building</h2>
      {building.map((b, i) => (
        <fieldset key={i} className="mb-4 rounded-md border border-border p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={fieldClass}>
              <label className={labelClass}>Title</label>
              <input
                className={inputClass}
                value={b.title}
                onChange={(e) =>
                  setBuilding(building.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                }
                required
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Link</label>
              <input
                className={inputClass}
                value={b.href}
                onChange={(e) =>
                  setBuilding(building.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))
                }
                required
              />
            </div>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Note</label>
            <textarea
              className={inputClass}
              rows={2}
              value={b.note}
              onChange={(e) =>
                setBuilding(building.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))
              }
              required
            />
          </div>
          <button
            type="button"
            className="text-sm text-muted-foreground underline"
            onClick={() => setBuilding(building.filter((_, j) => j !== i))}
          >
            Remove
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="mb-6 text-sm underline"
        onClick={() => setBuilding([...building, { title: "", href: "", note: "" }])}
      >
        + Add project
      </button>

      <h2 className="mb-2 text-lg font-semibold">Thinking about</h2>
      {thinkingAbout.map((t, i) => (
        <div key={i} className="mb-2 flex gap-2">
          <textarea
            className={inputClass}
            rows={2}
            value={t}
            onChange={(e) =>
              setThinkingAbout(thinkingAbout.map((x, j) => (j === i ? e.target.value : x)))
            }
            required
          />
          <button
            type="button"
            className="text-sm text-muted-foreground underline"
            onClick={() => setThinkingAbout(thinkingAbout.filter((_, j) => j !== i))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="mb-6 block text-sm underline"
        onClick={() => setThinkingAbout([...thinkingAbout, ""])}
      >
        + Add thought
      </button>

      <button
        type="submit"
        disabled={result.state === "saving"}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        Publish /now update
      </button>
      <p className="mt-2 text-xs text-muted-foreground">
        The &ldquo;last updated&rdquo; date is set to today automatically.
      </p>
      <PublishResult result={result} />
    </form>
  );
}
