"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import {
  photos,
  photoCategories,
  placeholderImages,
  type Photo,
  type PhotoCategory,
} from "@/constants/photos";
import { logError } from "@/lib/logger";

type PhotosGridProps = {
  initialCategory?: PhotoCategory;
};

type CategoryTabsProps = {
  selectedCategory: PhotoCategory;
  photoCount: number;
  onSelectCategory: (category: PhotoCategory) => void;
};

function CategoryTabs({ selectedCategory, photoCount, onSelectCategory }: CategoryTabsProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {photoCategories.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => onSelectCategory(category.value)}
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
        Showing {photoCount} photo{photoCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

type PhotoMasonryGridProps = {
  photosWithPlaceholders: Photo[];
  onOpen: (photo: Photo, index: number) => void;
};

function PhotoMasonryGrid({ photosWithPlaceholders, onOpen }: PhotoMasonryGridProps) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {photosWithPlaceholders.map((photo, index) => (
        <motion.button
          key={photo.id}
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="break-inside-avoid w-full text-left cursor-pointer group"
          onClick={() => onOpen(photo, index)}
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
        </motion.button>
      ))}
    </div>
  );
}

type PhotoLightboxProps = {
  currentPhoto: Photo | null;
  currentIndex: number;
  photosWithPlaceholders: Photo[];
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onDownload: (photo: Photo) => void;
};

function PhotoLightbox({
  currentPhoto,
  currentIndex,
  photosWithPlaceholders,
  onClose,
  onPrevious,
  onNext,
  onDownload,
}: PhotoLightboxProps) {
  return (
    <AnimatePresence>
      {currentPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={onClose}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          {currentIndex > 0 && (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              onClick={(event) => {
                event.stopPropagation();
                onPrevious();
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}

          {currentIndex < photosWithPlaceholders.length - 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              onClick={(event) => {
                event.stopPropagation();
                onNext();
              }}
              aria-label="Next photo"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}

          <motion.div
            key={currentPhoto.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-6xl max-h-[85vh] w-full mx-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`relative ${
                currentPhoto.aspectRatio === "portrait"
                  ? "aspect-[3/4] max-h-[75vh]"
                  : currentPhoto.aspectRatio === "landscape"
                    ? "aspect-[4/3]"
                    : "aspect-square"
              } mx-auto`}
              style={{ maxHeight: "75vh" }}
            >
              <Image
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-white text-lg font-medium mb-2">{currentPhoto.alt}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/70 text-sm">
                    {currentPhoto.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {currentPhoto.location}
                      </span>
                    )}
                    {currentPhoto.date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(currentPhoto.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/70 text-sm">
                  <span className="flex items-center gap-1.5">
                    <CameraIcon className="h-4 w-4" />
                    {currentPhoto.camera}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Aperture className="h-4 w-4" />
                    {currentPhoto.lens}
                  </span>
                  <span className="text-white/50">{currentPhoto.settings}</span>
                  {currentPhoto.recipe && (
                    <span className="flex items-center gap-1.5 text-primary">
                      <Palette className="h-4 w-4" />
                      {currentPhoto.recipe}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-white/50 text-sm">
                  {currentIndex + 1} of {photosWithPlaceholders.length}
                </span>
                <button
                  type="button"
                  onClick={() => onDownload(currentPhoto)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          </motion.div>

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
  );
}

function PhotosInstructions() {
  return (
    <div className="mt-12 neu-pressed rounded-xl p-6 text-center">
      <p className="text-muted-foreground text-sm">
        Add your photos to
        <code className="text-primary px-1 py-0.5 bg-primary/10 rounded"> /public/images/photos/travel/</code>
        or
        <code className="text-primary px-1 py-0.5 bg-primary/10 rounded"> /public/images/photos/nature/</code>
        and update
        <code className="text-primary px-1 py-0.5 bg-primary/10 rounded"> src/constants/photos.ts</code>
      </p>
    </div>
  );
}

export function PhotosGrid({ initialCategory = "all" }: PhotosGridProps) {
  const router = useRouter();
  const selectedCategory = initialCategory;
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const filteredPhotos = useMemo(
    () => (selectedCategory === "all" ? photos : photos.filter((photo) => photo.category === selectedCategory)),
    [selectedCategory]
  );

  const photosWithPlaceholders = useMemo(
    () =>
      filteredPhotos.map((photo, index) => {
        const categoryPlaceholders = placeholderImages[photo.category] || placeholderImages.travel;
        return {
          ...photo,
          src: categoryPlaceholders[index % categoryPlaceholders.length],
        };
      }),
    [filteredPhotos]
  );

  const handleCategoryChange = useCallback(
    (category: PhotoCategory) => {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );

      if (category === "all") {
        params.delete("category");
      } else {
        params.set("category", category);
      }

      router.push(`/photos${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [router]
  );

  const openLightbox = useCallback((photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedPhoto(null);
    setSelectedIndex(-1);
  }, []);

  const goToPrevious = useCallback(() => {
    if (selectedIndex <= 0) return;
    const nextIndex = selectedIndex - 1;
    setSelectedIndex(nextIndex);
    setSelectedPhoto(photosWithPlaceholders[nextIndex] ?? null);
  }, [photosWithPlaceholders, selectedIndex]);

  const goToNext = useCallback(() => {
    if (selectedIndex >= photosWithPlaceholders.length - 1) return;
    const nextIndex = selectedIndex + 1;
    setSelectedIndex(nextIndex);
    setSelectedPhoto(photosWithPlaceholders[nextIndex] ?? null);
  }, [photosWithPlaceholders, selectedIndex]);

  const handleDownload = useCallback(async (photo: Photo) => {
    try {
      const response = await fetch(photo.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${photo.alt.replace(/\s+/g, "-").toLowerCase()}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logError("Photo download failed", error, { component: "PhotosGrid" });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedPhoto) return;
      switch (event.key) {
        case "Escape":
          closeLightbox();
          return;
        case "ArrowLeft":
          goToPrevious();
          return;
        case "ArrowRight":
          goToNext();
          return;
        default:
          return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeLightbox, goToNext, goToPrevious, selectedPhoto]);

  return (
    <>
      <CategoryTabs
        selectedCategory={selectedCategory}
        photoCount={photosWithPlaceholders.length}
        onSelectCategory={handleCategoryChange}
      />

      <PhotoMasonryGrid photosWithPlaceholders={photosWithPlaceholders} onOpen={openLightbox} />

      {photosWithPlaceholders.length === 0 && (
        <div className="text-center py-16">
          <CameraIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No photos in this category yet.</p>
        </div>
      )}

      <PhotoLightbox
        currentPhoto={selectedPhoto}
        currentIndex={selectedIndex}
        photosWithPlaceholders={photosWithPlaceholders}
        onClose={closeLightbox}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onDownload={handleDownload}
      />

      <PhotosInstructions />
    </>
  );
}
