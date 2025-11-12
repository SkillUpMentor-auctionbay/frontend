"use client";

import * as React from "react";
import { getImageUrl } from "../../lib/image-url";

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
        <div className="w-full h-full bg-gray-20 rounded-xl flex items-center justify-center">
          <span className="text-gray-60 text-lg">No Image</span>
        </div>
      )}
    </div>
  );
}
