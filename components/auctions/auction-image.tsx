"use client";

import * as React from "react";
import { getImageUrl } from "../../lib/image-url";
import { ImageFallback } from "../ui/image-fallback";

interface AuctionImageProps {
  imageUrl?: string;
  title: string;
  className?: string;
}

export function AuctionImage({ imageUrl, title, className }: AuctionImageProps) {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className={`h-full ${className}`}>
      {imageUrl && !imageError ? (
        <img
          src={getImageUrl(imageUrl)}
          alt={title}
          className="w-full h-full object-cover rounded-2xl"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
      ) : (
        <ImageFallback
          text="No Image!"
          className="rounded-2xl"
          fallbackType="text"
        />
      )}
    </div>
  );
}
