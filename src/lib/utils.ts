import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Custom `@utility` font sizes declared in `src/app/globals.css`.
 *
 * tailwind-merge only knows the stock scale (`text-sm`, `text-4xl`, ...), so
 * anything else matching `text-*` is classified as a TEXT COLOUR. That had two
 * live consequences: `cn("text-foreground", "text-page-title")` silently
 * dropped `text-foreground` (same group, last wins), and a caller's
 * `text-4xl` did not override the module default `text-page-title` because
 * the two were in different groups — both survived and CSS source order
 * decided the rendered size.
 *
 * Registering them in `font-size` makes them conflict with `text-4xl` and stop
 * conflicting with `text-foreground`, which is what the CSS actually declares.
 */
const CUSTOM_FONT_SIZES = [
  // Heading scale
  "text-display",
  "text-page-title",
  "text-section-title",
  "text-card-title",
  "text-subsection",
  // Body / description scale
  "text-body-lg",
  "text-body",
  "text-body-sm",
  "text-description",
  "text-description-sm",
  "text-label",
  // Mono eyebrow label
  "label-mono",
] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [...CUSTOM_FONT_SIZES],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isMobile = () => {
  if (typeof window === "undefined") return false;
  const width = window.innerWidth;
  return width <= 1024;
};
