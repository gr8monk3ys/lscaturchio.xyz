"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

// Base64 blur placeholder for faster LCP
const BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsLCgsKCw0QDBINDQsODwsQDxMPEBAXFRUXFw8QFRQVFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAcI/8QAIhAAAQMDBAMBAAAAAAAAAAAAAQIDBAAFEQYHEiExE0FR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDESH/2gAMAwEAAhEDEEA/ANYbf3640xU+3SYjD7zThUhbhKHEE4yk4IIPjB+1VBvb6NI/3t//2Q==";

interface FallbackImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string;
  fallbackSrc?: string;
  onError?: (error: Error) => void;
  enableBlur?: boolean;
}

export function FallbackImage({
  src,
  fallbackSrc = "/images/blog/default.webp",
  alt,
  onError,
  enableBlur = true,
  ...props
}: FallbackImageProps) {
  const [failedSources, setFailedSources] = useState<Record<string, true>>({});
  const hasErrorForSource = Boolean(failedSources[src]);
  const imgSrc = hasErrorForSource ? fallbackSrc : src;

  const handleError = (error: Error) => {
    if (!hasErrorForSource) {
      setFailedSources((prev) => ({ ...prev, [src]: true }));

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
      placeholder={enableBlur ? "blur" : "empty"}
      blurDataURL={enableBlur ? BLUR_DATA_URL : undefined}
      onError={(e) => handleError(e as unknown as Error)}
    />
  );
}
