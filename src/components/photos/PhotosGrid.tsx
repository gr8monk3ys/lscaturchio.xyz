"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  X,
  MapPin,
  Calendar,
  Camera as CameraIcon,
  Aperture,
  Download,
  ChevronLeft,
  ChevronRight,
  Palette,
} from "lucide-react";
import { photos, photoCategories, placeholderImages, type Photo, type PhotoCategory } from "@/constants/photos";

export function PhotosGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as PhotoCategory | null;

  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>(categoryParam || "all");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Filter photos by category
  const filteredPhotos = selectedCategory === "all"
    ? photos
    : photos.filter((photo) => photo.category === selectedCategory);

  // Use placeholder images for development
  const photosWithPlaceholders = filteredPhotos.map((photo, index) => {
    const categoryPlaceholders = placeholderImages[photo.category] || placeholderImages.travel;
    return {
      ...photo,
      src: categoryPlaceholders[index % categoryPlaceholders.length],
    };
  });

  // Update URL when category changes
  const handleCategoryChange = (category: PhotoCategory) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/photos${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  // Open lightbox
  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  // Close lightbox
  const closeLightbox = () => {
    setSelectedPhoto(null);
    setSelectedIndex(-1);
  };

  // Navigate to previous photo
  const goToPrevious = useCallback(() => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelectedPhoto(photosWithPlaceholders[newIndex]);
    }
  }, [selectedIndex, photosWithPlaceholders]);

  // Navigate to next photo
  const goToNext = useCallback(() => {
    if (selectedIndex < photosWithPlaceholders.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelectedPhoto(photosWithPlaceholders[newIndex]);
    }
  }, [selectedIndex, photosWithPlaceholders]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, goToPrevious, goToNext]);

  // Download photo
  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${photo.alt.replace(/\s+/g, "-").toLowerCase()}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      {/* Category Filter Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {photoCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.value
                  ? "bg-primary text-primary-foreground"
                  : "neu-flat-sm hover:bg-primary/10"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {photosWithPlaceholders.length} photo{photosWithPlaceholders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Masonry-style Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {photosWithPlaceholders.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => openLightbox(photo, index)}
          >
            <div className="relative overflow-hidden rounded-xl neu-card p-1">
              <div
                className={`relative ${
                  photo.aspectRatio === "portrait"
                    ? "aspect-[3/4]"
                    : photo.aspectRatio === "landscape"
                    ? "aspect-[4/3]"
                    : "aspect-square"
                }`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="font-medium text-sm truncate">{photo.alt}</p>
                    {photo.location && (
                      <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {photo.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {photosWithPlaceholders.length === 0 && (
        <div className="text-center py-16">
          <CameraIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No photos in this category yet.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Previous button */}
            {selectedIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
            )}

            {/* Next button */}
            {selectedIndex < photosWithPlaceholders.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            )}

            {/* Photo */}
            <motion.div
              key={selectedPhoto.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl max-h-[85vh] w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`relative ${
                  selectedPhoto.aspectRatio === "portrait"
                    ? "aspect-[3/4] max-h-[75vh]"
                    : selectedPhoto.aspectRatio === "landscape"
                    ? "aspect-[4/3]"
                    : "aspect-square"
                } mx-auto`}
                style={{ maxHeight: "75vh" }}
              >
                <Image
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Photo metadata panel */}
              <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-white text-lg font-medium mb-2">{selectedPhoto.alt}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/70 text-sm">
                      {selectedPhoto.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {selectedPhoto.location}
                        </span>
                      )}
                      {selectedPhoto.date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {new Date(selectedPhoto.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* EXIF Data */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/70 text-sm">
                    <span className="flex items-center gap-1.5">
                      <CameraIcon className="h-4 w-4" />
                      {selectedPhoto.camera}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Aperture className="h-4 w-4" />
                      {selectedPhoto.lens}
                    </span>
                    <span className="text-white/50">{selectedPhoto.settings}</span>
                    {selectedPhoto.recipe && (
                      <span className="flex items-center gap-1.5 text-primary">
                        <Palette className="h-4 w-4" />
                        {selectedPhoto.recipe}
                      </span>
                    )}
                  </div>
                </div>

                {/* Download button */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-white/50 text-sm">
                    {selectedIndex + 1} of {photosWithPlaceholders.length}
                  </span>
                  <button
                    onClick={() => handleDownload(selectedPhoto)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Keyboard hints */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 text-white/40 text-xs">
              <span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded ml-1">→</kbd> navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> close
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions for adding photos */}
      <div className="mt-12 neu-pressed rounded-xl p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Add your photos to <code className="text-primary px-1 py-0.5 bg-primary/10 rounded">/public/images/photos/travel/</code> or{" "}
          <code className="text-primary px-1 py-0.5 bg-primary/10 rounded">/public/images/photos/nature/</code> and update{" "}
          <code className="text-primary px-1 py-0.5 bg-primary/10 rounded">src/constants/photos.ts</code>
        </p>
      </div>
    </>
  );
}
