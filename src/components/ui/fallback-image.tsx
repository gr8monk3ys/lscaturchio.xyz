"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface FallbackImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string;
  fallbackSrc?: string;
  onError?: (error: Error) => void;
}

export function FallbackImage({
  src,
  fallbackSrc = "/images/blog/default.jpg",
  alt,
  onError,
  ...props
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when src changes
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = (error: Error) => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
      
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={(e) => handleError(e as unknown as Error)}
    />
  );
}
