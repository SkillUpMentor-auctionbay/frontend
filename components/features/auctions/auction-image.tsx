'use client';

import { ImageFallback } from '@/components/ui/primitives/image-fallback';
import { getImageUrl } from '@/utils/imageUtils';
import Image from 'next/image';
import * as React from 'react';

interface AuctionImageProps {
  readonly imageUrl?: string;
  readonly title: string;
  readonly className?: string;
}

export function AuctionImage({
  imageUrl,
  title,
  className,
}: AuctionImageProps) {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className={`h-full relative ${className}`}>
      {imageUrl && !imageError ? (
        <Image
          src={getImageUrl(imageUrl)!}
          alt={title}
          onError={handleImageError}
          fill
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
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
