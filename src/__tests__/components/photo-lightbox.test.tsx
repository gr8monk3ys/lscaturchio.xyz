import { describe, it, expect, vi, afterEach } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import type { Photo } from "@/constants/photos";

/**
 * The photo lightbox as a modal.
 *
 * It was a full-screen 95%-black overlay with no dialog role, no
 * `aria-modal`, no trap and no focus return: Tab walked out into the gallery
 * behind it, a screen reader was never told it had opened, and closing it left
 * focus wherever it had wandered. The shared behaviour is pinned in
 * `use-modal-overlay.test.tsx`; this pins that the lightbox actually uses it,
 * with the right name, the right first stop and the right way back.
 *
 * The gallery ships empty (`src/data/photos.json` is `[]`), so the photos are
 * mocked. happy-dom does not move focus on Tab, so a Tab the hook leaves alone
 * returns `true` from `fireEvent` and the hook's own moves are read off
 * `document.activeElement`.
 */

const PHOTOS = vi.hoisted(
  (): Photo[] =>
    ["Harbour at dusk", "Pines after rain", "Salt flats"].map((alt, index) => ({
      id: `photo-${index}`,
      src: `/images/photos/travel/${index}.webp`,
      alt,
      category: "travel",
      camera: "Fujifilm X-T30 II",
      lens: "XF 23mm f/2",
      settings: "f/8 · 1/250 · ISO 160",
      date: "2026-05-01",
      aspectRatio: "landscape",
    }))
);

vi.mock("@/constants/photos", () => ({
  photos: PHOTOS,
  photoCategories: [{ value: "all", label: "All" }],
}));

const { PhotosGrid } = await import("@/components/photos/PhotosGrid");

async function nextFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  });
}

function thumbnail(alt: string): HTMLElement {
  const image = screen.getAllByAltText(alt).find((img) => img.closest("[data-photo-id]"));
  return image!.closest("button")!;
}

async function openFrom(alt: string) {
  const opener = thumbnail(alt);
  opener.focus();
  fireEvent.click(opener);
  await nextFrame();
  return opener;
}

function tab(shiftKey = false) {
  return fireEvent.keyDown(document.activeElement ?? document.body, { key: "Tab", shiftKey });
}

afterEach(() => {
  cleanup();
});

describe("photo lightbox", () => {
  it("is a modal dialog named by the photo's caption", async () => {
    render(<PhotosGrid />);
    await openFrom("Pines after rain");

    const dialog = screen.getByRole("dialog", { name: "Pines after rain" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("moves focus to the close button on open", async () => {
    render(<PhotosGrid />);
    await openFrom("Pines after rain");

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close lightbox" }));
  });

  it("keeps Tab inside the dialog in both directions", async () => {
    render(<PhotosGrid />);
    await openFrom("Pines after rain");
    const dialog = screen.getByRole("dialog");

    // The middle photo has Previous and Next, so the cycle runs close →
    // previous → next → download. Tab from the last stop wraps to the first.
    screen.getByRole("button", { name: "Download" }).focus();
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close lightbox" }));

    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Download" }));

    // Focus that got behind the overlay is pulled back in, not left there.
    thumbnail("Salt flats").focus();
    expect(tab()).toBe(false);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("closes on Escape and returns focus to the thumbnail that opened it", async () => {
    render(<PhotosGrid />);
    const opener = await openFrom("Pines after rain");

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.activeElement).toBe(opener);
  });

  it("returns focus to the opening thumbnail even after paging to another photo", async () => {
    render(<PhotosGrid />);
    const opener = await openFrom("Pines after rain");

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("dialog", { name: "Salt flats" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close lightbox" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.activeElement).toBe(opener);
  });

  it("falls back to the opening thumbnail when the browser recorded no opener", async () => {
    render(<PhotosGrid />);
    // Safari does not focus a clicked button, so nothing had focus on open.
    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.click(thumbnail("Salt flats"));
    await nextFrame();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.activeElement).toBe(thumbnail("Salt flats"));
  });

  it("pages with the arrow keys and stops at the ends", async () => {
    render(<PhotosGrid />);
    await openFrom("Harbour at dusk");

    expect(screen.queryByRole("button", { name: "Previous photo" })).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("dialog", { name: "Harbour at dusk" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("dialog", { name: "Pines after rain" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("dialog", { name: "Salt flats" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("dialog", { name: "Salt flats" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("dialog", { name: "Pines after rain" })).toBeInTheDocument();
  });

  // ⌘K opens the palette over the lightbox; arrows in its input move the
  // caret and must not page the photo underneath.
  it("leaves arrow keys typed into a text field alone", async () => {
    render(<PhotosGrid />);
    await openFrom("Pines after rain");
    const field = document.createElement("input");
    document.body.appendChild(field);
    try {
      fireEvent.keyDown(field, { key: "ArrowRight" });
      expect(screen.getByRole("dialog", { name: "Pines after rain" })).toBeInTheDocument();
    } finally {
      field.remove();
    }
  });
});
