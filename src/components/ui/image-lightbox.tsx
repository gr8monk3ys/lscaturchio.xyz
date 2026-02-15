"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan values for zoomed images
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Track state that resets with each image or lightbox open
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  // Reset view state helper
  const resetViewState = useCallback(() => {
    setZoom(1);
    setRotation(0);
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Navigation functions - include reset in navigation
  const goToNext = useCallback(() => {
    if (hasMultiple) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      resetViewState();
    }
  }, [hasMultiple, images.length, resetViewState]);

  const goToPrev = useCallback(() => {
    if (hasMultiple) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      resetViewState();
    }
  }, [hasMultiple, images.length, resetViewState]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        x.set(0);
        y.set(0);
      }
      return newZoom;
    });
  }, [x, y]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Rotate function
  const rotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Download function
  const downloadImage = useCallback(async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentImage.alt || "image";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(currentImage.src, "_blank");
    }
  }, [currentImage]);

  // Keyboard handlers
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "ArrowLeft":
          goToPrev();
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
        case "0":
          resetZoom();
          break;
        case "r":
        case "R":
          rotate();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goToNext, goToPrev, zoomIn, zoomOut, resetZoom, rotate]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    },
    [zoomIn, zoomOut]
  );

  // Touch/drag constraints
  const dragConstraints = zoom > 1 ? { left: -200 * zoom, right: 200 * zoom, top: -200 * zoom, bottom: 200 * zoom } : { left: 0, right: 0, top: 0, bottom: 0 };

  if (!currentImage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-2 rounded-full bg-black/50 backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              disabled={zoom === 1}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-white text-sm min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomIn();
              }}
              disabled={zoom >= 4}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-white/20" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                rotate();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label="Rotate image"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                downloadImage();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label="Download image"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Image container */}
          <motion.div
            ref={containerRef}
            className="relative max-w-[90vw] max-h-[80vh] cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            drag={zoom > 1}
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            style={{ x, y }}
          >
            <motion.div
              animate={{
                scale: zoom,
                rotate: rotation,
              }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
              className="relative"
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={currentImage.width || 1200}
                height={currentImage.height || 800}
                className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Caption and counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-center">
            {currentImage.caption && (
              <p className="text-white text-sm mb-2 max-w-md">
                {currentImage.caption}
              </p>
            )}
            {hasMultiple && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-white/60 text-sm">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip for multiple images */}
          {hasMultiple && images.length <= 10 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm">
              {images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    "relative w-12 h-12 rounded overflow-hidden transition-all",
                    currentIndex === index
                      ? "ring-2 ring-white scale-110"
                      : "opacity-50 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Keyboard hints */}
          <div className="absolute bottom-4 right-4 text-white/40 text-xs hidden md:block">
            <div>← → Navigate</div>
            <div>+/- Zoom</div>
            <div>R Rotate</div>
            <div>Esc Close</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to use lightbox with any image
export function useLightbox(images: LightboxImage[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const open = useCallback((index = 0) => {
    setInitialIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    initialIndex,
    open,
    close,
    LightboxComponent: () => (
      <ImageLightbox
        images={images}
        initialIndex={initialIndex}
        isOpen={isOpen}
        onClose={close}
      />
    ),
  };
}

// Wrapper component for single images
interface LightboxImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function LightboxImage({
  src,
  alt,
  caption,
  width = 800,
  height = 600,
  className,
  priority = false,
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const openLightbox = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    // Return focus to the trigger element when lightbox closes
    triggerRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox();
      }
    },
    [openLightbox]
  );

  return (
    <>
      <motion.div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-label={alt ? `View ${alt} in lightbox` : 'View image in lightbox'}
        className={cn(
          "relative cursor-zoom-in overflow-hidden rounded-lg",
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={openLightbox}
        onKeyDown={handleKeyDown}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
          priority={priority}
        />
        {/* Zoom indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors opacity-0 hover:opacity-100">
          <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
        {caption && (
          <p className="mt-2 text-sm text-muted-foreground text-center">
            {caption}
          </p>
        )}
      </motion.div>

      <ImageLightbox
        images={[{ src, alt, caption, width, height }]}
        isOpen={isOpen}
        onClose={closeLightbox}
      />
    </>
  );
}
