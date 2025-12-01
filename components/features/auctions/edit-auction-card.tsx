"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { InputField } from "@/components/ui/primitives/input";
import { TextAreaField } from "@/components/ui/primitives/textarea-field";
import { useEditAuction } from "@/hooks/useEditAuction";
import { EditAuctionFormData, AuctionData } from "@/types/auction";
import { getImageUrl } from "@/lib/image-url";
import { ImageFallback } from "@/components/ui/primitives/image-fallback";
import { AuctionImageUpload } from "./auction-image-upload";

const formatEuropeanDate = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}.${month}.${year}`;
  } catch {
    return '';
  }
};

export interface EditAuctionCardProps {
  className?: string;
  auction: AuctionData;
  onSubmit?: (data: EditAuctionFormData) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const EditAuctionCard = React.forwardRef<HTMLDivElement, EditAuctionCardProps>(
  ({ className, auction, onSubmit, onCancel, isEditing = false, ...props }, ref) => {
    if (!auction) {
      return <div className="p-4 text-red-500">Error: No auction data available for editing.</div>;
    }

    if (auction.status === "done" || new Date(auction.endTime) <= new Date()) {
      return (
        <div className="p-4 text-red-500">
          This auction has ended and cannot be edited.
        </div>
      );
    }

    const { editAuction, isLoading, validationErrors } = useEditAuction();

    const [formData, setFormData] = React.useState<EditAuctionFormData>(() => ({
      id: auction.id,
      title: auction.title,
      description: auction.description,
      startingPrice: auction.startingPrice?.toString() || '0',
      endDate: auction.endTime ? formatEuropeanDate(auction.endTime) : '',
      existingImageUrl: auction.imageUrl,
    }));

    React.useEffect(() => {
      if (auction && (auction.id !== formData.id || auction.description !== formData.description)) {
        setFormData({
          id: auction.id,
          title: auction.title || '',
          description: auction.description || '',
          startingPrice: auction.startingPrice?.toString() || '0',
          endDate: auction.endTime ? formatEuropeanDate(auction.endTime) : '',
          existingImageUrl: auction.imageUrl || undefined,
        });
      }
    }, [auction]);

    const [imagePreview, setImagePreview] = React.useState<string | null>(() => {
      const url = auction.imageUrl ? getImageUrl(auction.imageUrl) : null;
      return url || null;
    });

    const [imageError, setImageError] = React.useState(false);

    React.useEffect(() => {
      if (auction?.imageUrl) {
        const url = getImageUrl(auction.imageUrl);
        setImagePreview(url || null);
        setImageError(false);
      } else {
        setImagePreview(null);
        setImageError(false);
      }
    }, [auction?.imageUrl]);

    const handleInputChange = (field: keyof EditAuctionFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageError = React.useCallback(() => {
      setImageError(true);
    }, []);

    const handleImageChange = (file: File) => {
      setFormData(prev => ({ ...prev, image: file }));
      setImageError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    const handleImageDelete = () => {
      setImagePreview(null);
      setImageError(false);
      setFormData(prev => ({
        ...prev,
        image: undefined,
        existingImageUrl: undefined
      }));
    };

    const handleSubmit = async () => {
      try {
        const hasChanges = formData.title !== auction.title ||
                          formData.description !== auction.description ||
                          formData.endDate !== formatEuropeanDate(auction.endTime) ||
                          (formData.image !== undefined) ||
                          (formData.existingImageUrl === undefined && auction.imageUrl !== undefined);

        if (!hasChanges) {
          if (onCancel) {
            onCancel();
          }
          return;
        }

        await editAuction(formData.id, formData, auction);

        if (onSubmit) {
          onSubmit({ ...formData, success: true });
        }
      } catch (error) {
        if ((error as any)?.code === 'VALIDATION_ERROR') {
          return;
        }
      }
    };

    
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-2xl p-4 flex flex-col gap-4 w-full max-w-[533px]",
          className
        )}
        {...props}
      >
  
        <AuctionImageUpload
          imagePreview={imagePreview}
          existingImageUrl={formData.existingImageUrl}
          onImageChange={handleImageChange}
          onImageDelete={handleImageDelete}
          validationError={validationErrors?.image}
          imageError={imageError}
        />

        <div className="flex flex-col gap-4">
          <div>
            <InputField
              label="Title"
              placeholder="Write item name here"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
            {validationErrors?.title && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
            )}
          </div>

          <div>
            <TextAreaField
              label="Description"
              placeholder="Write description here..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={5}
            />
            {validationErrors?.description && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>

          <div className="w-full">
            <InputField
              label="End date"
              type="text"
              placeholder="dd.mm.yyyy"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              rightIcon="Time"
              rightIconClickable={false}
              className="w-full"
            />
            {validationErrors?.endDate && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="alternative"
            onClick={onCancel}
            disabled={isLoading}
          >
            Discard changes
          </Button>
          <Button
            variant="secondary"
            onClick={handleSubmit}
            disabled={isLoading}
            className="relative"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </div>
            ) : (
              "Edit auction"
            )}
          </Button>
        </div>
      </div>
    );
  }
);

EditAuctionCard.displayName = "EditAuctionCard";

export { EditAuctionCard };