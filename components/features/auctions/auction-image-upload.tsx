"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { ImageFallback } from "@/components/ui/primitives/image-fallback";
import { getImageUrl } from "@/lib/image-url";

interface AuctionImageUploadProps {
  imagePreview: string | null;
  existingImageUrl?: string;
  onImageChange: (file: File) => void;
  onImageDelete: () => void;

  validationError?: string;
  imageError?: boolean;
  disabled?: boolean;

  className?: string;
}

export const AuctionImageUpload = React.forwardRef<HTMLDivElement, AuctionImageUploadProps>(
  ({
    imagePreview,
    existingImageUrl,
    onImageChange,
    onImageDelete,
    validationError,
    imageError = false,
    disabled = false,
    className,
    ...props
  }, ref) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageChange(file);
      }
    };

    const displayImage = imagePreview || (existingImageUrl ? getImageUrl(existingImageUrl) : null);

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="bg-background rounded-2xl h-[168px] flex flex-col items-center justify-center relative overflow-hidden">
          {displayImage && !imageError ? (
            <div className="relative w-full h-full">
              <img
                src={displayImage}
                alt="Auction preview"
                className="w-full h-full object-cover rounded-2xl"
                onError={() => {
                  // Parent handles image error state
                }}
              />
              <Button
                variant="secondary"
                leftIcon="Delete"
                iconSize={16}
                className="absolute top-2 right-2"
                onClick={onImageDelete}
              />
            </div>
          ) : imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <ImageFallback
                text="Image failed to load"
                className="rounded-2xl"
                fallbackType="text"
              />
            </div>
          ) : (
            <Button
              variant="tertiary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              Add image
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
        {validationError && (
          <p className="text-red-500 text-sm mt-1">{validationError}</p>
        )}
      </div>
    );
  }
);

AuctionImageUpload.displayName = "AuctionImageUpload";