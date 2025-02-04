import Image from 'next/image'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/animations'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  fill?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  fill = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <motion.div
      className={`relative ${className} ${
        isLoading ? 'animate-pulse bg-muted' : ''
      }`}
      variants={fadeIn}
      initial="initial"
      animate="animate"
      style={fill ? { width: '100%', height: '100%' } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        priority={priority}
        fill={fill}
        className={`${
          isLoading
            ? 'scale-110 blur-2xl grayscale'
            : 'scale-100 blur-0 grayscale-0'
        } transition-all duration-300`}
        onLoadingComplete={() => setIsLoading(false)}
        sizes={fill ? "(max-width: 768px) 100vw, 50vw" : undefined}
      />
    </motion.div>
  )
}
