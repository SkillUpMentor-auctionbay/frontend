"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { ImageFallback } from "@/components/ui/primitives/image-fallback";
import { getImageUrl } from "@/utils/imageUtils";

interface AuctionImageUploadProps {
  // Common props
  imagePreview: string | null;
  onImageChange: (file: File) => void;
  validationError?: string;
  imageError?: boolean;
  disabled?: boolean;
  className?: string;

  // Props for edit scenario (existing image)
  existingImageUrl?: string;
  onImageDelete?: () => void;

  // Props to control behavior
  showAddButton?: boolean;
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
    showAddButton = true,
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

    // Display existing image, new preview, or add button
    const displayImage = imagePreview || (existingImageUrl ? getImageUrl(existingImageUrl) : null);
    const hasExistingOrNewImage = displayImage && !imageError;

    const handleImageClick = (e: React.MouseEvent) => {
      // Don't trigger if clicking on buttons or other interactive elements
      if ((e.target as HTMLElement).tagName === 'BUTTON' ||
          (e.target as HTMLElement).closest('button')) {
        return;
      }

      if (!hasExistingOrNewImage && showAddButton) {
        fileInputRef.current?.click();
      }
    };

    const handleAddButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event bubbling to parent
      fileInputRef.current?.click();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onImageDelete) {
        onImageDelete();
      }
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div
          className="bg-background rounded-2xl h-[168px] flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          {hasExistingOrNewImage ? (
            <div className="relative w-full h-full">
              <img
                src={displayImage}
                alt="Auction image"
                className="w-full h-full object-cover rounded-2xl"
                onError={() => {
                  // Parent handles image error state through imageError prop
                }}
              />
              {onImageDelete && (
                <Button
                  variant="secondary"
                  leftIcon="Delete"
                  iconSize={16}
                  className="absolute top-2 right-2"
                  onClick={handleDeleteClick}
                  disabled={disabled}
                />
              )}
            </div>
          ) : imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <ImageFallback
                text="Image failed to load"
                className="rounded-2xl"
                fallbackType="text"
              />
            </div>
          ) : showAddButton ? (
            <Button
              variant="tertiary"
              onClick={handleAddButtonClick}
              disabled={disabled}
            >
              Add image
            </Button>
          ) : null}
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