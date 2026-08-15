export interface Photo {
  id: string;
  src: string;
  alt: string;
  category: "travel" | "nature";
  camera: string;
  lens: string;
  settings: string;
  recipe?: string;
  location?: string;
  date: string;
  aspectRatio: "square" | "portrait" | "landscape";
}

export type PhotoCategory = "all" | "travel" | "nature";

export const photoCategories: { value: PhotoCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "travel", label: "Travel & Landscape" },
  { value: "nature", label: "Nature" },
];

// Adding photos: use the /admin portal (Photos), which converts uploads to
// webp (q85, max 1920px), computes the aspect ratio, and commits the files
// plus the entries in src/data/photos.json in one commit. Manual fallback:
//   1. cwebp -q 85 -resize 1920 0 input.jpg -o output.webp
//   2. Drop files under /public/images/photos/travel/ or .../nature/
//   3. Add an entry to src/data/photos.json with the real camera settings.
//
// The gallery ships empty until real photos exist. It previously held six
// "sample" entries that rendered Unsplash stock with invented settings and
// locations — stock photography presented as mine. Bare walls are better.
import photosJson from "@/data/photos.json";

export const photos: Photo[] = photosJson as Photo[];
