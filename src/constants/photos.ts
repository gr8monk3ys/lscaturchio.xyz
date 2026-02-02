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

// Sample photos - replace with your actual photos
// Export your photos from Photos app, optimize with:
// cwebp -q 85 -resize 1920 0 input.jpg -o output.webp
export const photos: Photo[] = [
  // Travel & Landscape
  {
    id: "travel-1",
    src: "/images/photos/travel/sample-1.webp",
    alt: "Mountain landscape at golden hour",
    category: "travel",
    camera: "Fuji X-T30 II",
    lens: "XF 18-55mm f/2.8-4",
    settings: "f/8 \u2022 1/250s \u2022 ISO 200",
    recipe: "Classic Neg",
    location: "Sample Location",
    date: "2024-12-01",
    aspectRatio: "landscape",
  },
  {
    id: "travel-2",
    src: "/images/photos/travel/sample-2.webp",
    alt: "Coastal sunset view",
    category: "travel",
    camera: "Fuji X-T30 II",
    lens: "XF 18-55mm f/2.8-4",
    settings: "f/5.6 \u2022 1/125s \u2022 ISO 400",
    recipe: "Velvia",
    location: "Sample Location",
    date: "2024-11-15",
    aspectRatio: "landscape",
  },
  {
    id: "travel-3",
    src: "/images/photos/travel/sample-3.webp",
    alt: "City skyline at dusk",
    category: "travel",
    camera: "Fuji X-T30 II",
    lens: "XF 18-55mm f/2.8-4",
    settings: "f/4 \u2022 1/60s \u2022 ISO 800",
    recipe: "Classic Chrome",
    location: "Sample Location",
    date: "2024-10-20",
    aspectRatio: "portrait",
  },
  // Nature
  {
    id: "nature-1",
    src: "/images/photos/nature/sample-1.webp",
    alt: "Forest trail in morning mist",
    category: "nature",
    camera: "Fuji X-T30 II",
    lens: "XF 18-55mm f/2.8-4",
    settings: "f/2.8 \u2022 1/500s \u2022 ISO 200",
    recipe: "Pro Neg Std",
    location: "Sample Location",
    date: "2024-09-10",
    aspectRatio: "portrait",
  },
  {
    id: "nature-2",
    src: "/images/photos/nature/sample-2.webp",
    alt: "Wildflowers in meadow",
    category: "nature",
    camera: "Fuji X-T30 II",
    lens: "XF 18-55mm f/2.8-4",
    settings: "f/4 \u2022 1/1000s \u2022 ISO 200",
    recipe: "Astia",
    location: "Sample Location",
    date: "2024-08-25",
    aspectRatio: "landscape",
  },
  {
    id: "nature-3",
    src: "/images/photos/nature/sample-3.webp",
    alt: "Stream through rocks",
    category: "nature",
    camera: "Fuji X-T30 II",
    lens: "XF 18-55mm f/2.8-4",
    settings: "f/11 \u2022 1/4s \u2022 ISO 100",
    recipe: "Eterna",
    location: "Sample Location",
    date: "2024-07-15",
    aspectRatio: "square",
  },
];

// Placeholder images for development (remove when adding real photos)
export const placeholderImages: Record<string, string[]> = {
  travel: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  ],
  nature: [
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800",
  ],
};
