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

// Adding photos:
//   1. Export from the Photos app and optimize:
//        cwebp -q 85 -resize 1920 0 input.jpg -o output.webp
//   2. Drop files under /public/images/photos/travel/ or .../nature/
//   3. Add an entry here with the real camera settings.
//
// The gallery ships empty until real photos exist. It previously held six
// "sample" entries that rendered Unsplash stock with invented settings and
// locations — stock photography presented as mine. Bare walls are better.
export const photos: Photo[] = [];
