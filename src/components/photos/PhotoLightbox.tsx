'use client'

import Image from 'next/image'
import { m, AnimatePresence } from '@/lib/motion'
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
} from 'lucide-react'
import type { Photo } from '@/constants/photos'

type PhotoLightboxProps = {
  currentPhoto: Photo | null
  currentIndex: number
  totalCount: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  onDownload: (photo: Photo) => void
}

export function PhotoLightbox({
  currentPhoto,
  currentIndex,
  totalCount,
  onClose,
  onPrevious,
  onNext,
  onDownload,
}: PhotoLightboxProps): React.ReactNode {
  return (
    <AnimatePresence>
      {currentPhoto && (
        <m.div
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
                event.stopPropagation()
                onPrevious()
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}

          {currentIndex < totalCount - 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              onClick={(event) => {
                event.stopPropagation()
                onNext()
              }}
              aria-label="Next photo"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}

          <m.div
            key={currentPhoto.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-6xl max-h-[85vh] w-full mx-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`relative ${
                currentPhoto.aspectRatio === 'portrait'
                  ? 'aspect-3/4 max-h-[75vh]'
                  : currentPhoto.aspectRatio === 'landscape'
                    ? 'aspect-4/3'
                    : 'aspect-square'
              } mx-auto`}
              style={{ maxHeight: '75vh' }}
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

            <div className="mt-4 bg-white/5 backdrop-blur-xs rounded-xl p-4 md:p-6">
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
                        {new Date(currentPhoto.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
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
                  {currentIndex + 1} of {totalCount}
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
          </m.div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 text-white/40 text-xs">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded ml-1">→</kbd> navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> close
            </span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
