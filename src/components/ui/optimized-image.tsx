import Image from 'next/image'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/animations'
import { useState, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  fill?: boolean
  quality?: number
  loading?: 'eager' | 'lazy'
  placeholder?: 'blur' | 'empty'
  sizes?: string
  fetchPriority?: 'high' | 'low' | 'auto'
}

/**
 * Enhanced Image component with performance optimizations
 * - Progressive loading with blur-up effect
 * - Proper aspect ratio to prevent layout shifts
 * - Appropriate size definitions for responsive layouts
 * - Lazy loading with priority configuration
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  fill = false,
  quality = 85,
  loading = 'lazy',
  placeholder = 'empty',
  sizes = fill 
    ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
    : undefined,
  fetchPriority = priority ? 'high' : 'auto',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  
  // Generate blurred placeholder
  const blurDataURL = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${
    width || 40
  } ${
    height || 30
  }'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' x='0' y='0' fill='%23f8f9fa' filter='url(%23b)'/%3E%3C/svg%3E`;
  
  // Determine if the image should be loaded with high priority
  const shouldPrioritize = priority || loading === 'eager' || fetchPriority === 'high';
  
  // Only observe if not prioritized
  useEffect(() => {
    if (shouldPrioritize) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, {
      rootMargin: '200px', // Load when within 200px of viewport
      threshold: 0.01
    });
    
    // Create a ref-like element to observe
    const element = document.getElementById(`image-container-${src.replace(/\W/g, '')}`);
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) observer.disconnect();
    };
  }, [src, shouldPrioritize]);
  
  return (
    <motion.div
      id={`image-container-${src.replace(/\W/g, '')}`}
      className={`relative overflow-hidden ${className} ${
        isLoading ? 'animate-pulse bg-muted' : ''
      }`}
      variants={fadeIn}
      initial="initial"
      animate="animate"
      style={{
        width: fill ? '100%' : width ? `${width}px` : undefined,
        height: fill ? '100%' : height ? `${height}px` : undefined,
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
      }}
    >
      {(isVisible || shouldPrioritize) && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          priority={shouldPrioritize}
          fill={fill}
          quality={quality}
          loading={shouldPrioritize ? undefined : loading}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={`${
            isLoading
              ? 'scale-105 blur-md grayscale'
              : 'scale-100 blur-0 grayscale-0'
          } transition-all duration-300 ease-in-out object-cover`}
          onLoad={() => setIsLoading(false)}
          sizes={sizes}
          fetchPriority={fetchPriority}
          style={{
            // Prevent layout shift with container aspect ratio
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          unoptimized={false}
        />
      )}
    </motion.div>
  )
}
