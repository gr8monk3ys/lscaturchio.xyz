"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, MapPin, Calendar, Camera as CameraIcon, Heart } from "lucide-react";

interface Photo {
  id: string;
  src: string;
  alt: string;
  location?: string;
  date?: string;
  camera?: string;
  aspectRatio: "square" | "portrait" | "landscape";
}

// Placeholder photos - replace with your actual photos
const photos: Photo[] = [
  {
    id: "1",
    src: "/images/photos/photo-1.webp",
    alt: "Sunset over the Pacific Ocean",
    location: "Malibu, CA",
    date: "2024-08",
    camera: "Sony A7III",
    aspectRatio: "landscape"
  },
  {
    id: "2",
    src: "/images/photos/photo-2.webp",
    alt: "Downtown Los Angeles skyline",
    location: "Los Angeles, CA",
    date: "2024-07",
    camera: "Sony A7III",
    aspectRatio: "portrait"
  },
  {
    id: "3",
    src: "/images/photos/photo-3.webp",
    alt: "Joshua Tree at golden hour",
    location: "Joshua Tree, CA",
    date: "2024-06",
    camera: "Sony A7III",
    aspectRatio: "square"
  },
  {
    id: "4",
    src: "/images/photos/photo-4.webp",
    alt: "Mountain trail in Big Sur",
    location: "Big Sur, CA",
    date: "2024-05",
    camera: "Sony A7III",
    aspectRatio: "landscape"
  },
  {
    id: "5",
    src: "/images/photos/photo-5.webp",
    alt: "Street photography in San Francisco",
    location: "San Francisco, CA",
    date: "2024-04",
    camera: "Sony A7III",
    aspectRatio: "portrait"
  },
  {
    id: "6",
    src: "/images/photos/photo-6.webp",
    alt: "Coffee shop interior",
    location: "Pasadena, CA",
    date: "2024-03",
    camera: "Sony A7III",
    aspectRatio: "square"
  },
  {
    id: "7",
    src: "/images/photos/photo-7.webp",
    alt: "Night cityscape",
    location: "Los Angeles, CA",
    date: "2024-02",
    camera: "Sony A7III",
    aspectRatio: "landscape"
  },
  {
    id: "8",
    src: "/images/photos/photo-8.webp",
    alt: "Beach waves at sunrise",
    location: "Huntington Beach, CA",
    date: "2024-01",
    camera: "Sony A7III",
    aspectRatio: "landscape"
  },
  {
    id: "9",
    src: "/images/photos/photo-9.webp",
    alt: "Desert landscape",
    location: "Death Valley, CA",
    date: "2023-12",
    camera: "Sony A7III",
    aspectRatio: "portrait"
  },
];

// Use placeholder images until real photos are added
const placeholderImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
  "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
];

export function PhotosGrid() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Use placeholder images for now
  const photosWithPlaceholders = photos.map((photo, index) => ({
    ...photo,
    src: placeholderImages[index % placeholderImages.length]
  }));

  return (
    <>
      {/* Instagram-style Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        {photosWithPlaceholders.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative cursor-pointer group ${
              photo.aspectRatio === "portrait" ? "row-span-2" :
              photo.aspectRatio === "landscape" && index % 5 === 0 ? "col-span-2" : ""
            }`}
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative aspect-square overflow-hidden rounded-lg neu-card p-1">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
                <div className="text-white text-center">
                  {photo.location && (
                    <p className="text-sm flex items-center justify-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {photo.location}
                    </p>
                  )}
                </div>
              </div>
              {/* Like button */}
              <button
                onClick={(e) => toggleLike(photo.id, e)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart
                  className={`h-5 w-5 ${
                    likedPhotos.has(photo.id)
                      ? "text-red-500 fill-red-500"
                      : "text-white"
                  }`}
                />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-8 w-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video">
                <Image
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              {/* Photo info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white text-lg font-medium mb-2">{selectedPhoto.alt}</p>
                <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                  {selectedPhoto.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedPhoto.location}
                    </span>
                  )}
                  {selectedPhoto.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {selectedPhoto.date}
                    </span>
                  )}
                  {selectedPhoto.camera && (
                    <span className="flex items-center gap-1">
                      <CameraIcon className="h-4 w-4" />
                      {selectedPhoto.camera}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add your photos prompt */}
      <div className="mt-12 neu-pressed rounded-xl p-6 text-center">
        <p className="text-muted-foreground">
          Add your own photos to <code className="text-primary">/public/images/photos/</code> and update
          the photos array in <code className="text-primary">PhotosGrid.tsx</code>.
        </p>
      </div>
    </>
  );
}
