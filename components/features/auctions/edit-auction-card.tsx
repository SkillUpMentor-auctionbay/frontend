"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { InputField } from "@/components/ui/primitives/input";
import { TextAreaField } from "@/components/ui/primitives/textarea-field";
import { useEditAuction } from "@/hooks/useEditAuction";
import { EditAuctionFormData, AuctionData, AuctionError } from "@/types/auction";
import { AuctionImageUpload } from "./auction-image-upload";
import { useAuctionImage } from "@/hooks/useAuctionImage";
import { useAuctionValidation } from "@/hooks/useAuctionValidation";

import { DatePicker } from "@/components/ui/primitives/date-picker";


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
    // Always call hooks first, before any early returns
    const { editAuction, isLoading, validationErrors } = useEditAuction();
    const { clearFieldError } = useAuctionValidation('edit');
    const { imageState, handleImageSelect, handleImageDelete: deleteImage } = useAuctionImage(auction.imageUrl, 'edit');

    


    // Initialize form data using key-based re-initialization pattern
    // Use safe defaults if auction is undefined
    const [formData, setFormData] = React.useState<EditAuctionFormData>(() => ({
      id: auction?.id || '',
      title: auction?.title || '',
      description: auction?.description || '',
      startingPrice: auction?.startingPrice?.toString() || '0',
      endDate: auction?.endTime ? formatEuropeanDate(auction.endTime) : '',
      existingImageUrl: auction?.imageUrl,
    }));

    // Early returns after all hooks are called
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

    const handleInputChange = (field: keyof EditAuctionFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear validation error for this field when user types
      clearFieldError(field);
    };

    const handleImageChange = (file: File) => {
      handleImageSelect(file);
      setFormData(prev => ({ ...prev, image: file }));
    };

    const handleImageDelete = () => {
      deleteImage();
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
        if ((error as AuctionError)?.code === 'VALIDATION_ERROR') {
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
          imagePreview={imageState.preview}
          existingImageUrl={imageState.existingUrl}
          onImageChange={handleImageChange}
          onImageDelete={handleImageDelete}
          validationError={imageState.validationError || validationErrors?.image}
          imageError={imageState.error}
        />

        <div className="flex flex-col gap-4">
          <div>
            <InputField
              label="Title"
              placeholder="Write item name here"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={!isEditing}
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
              disabled={!isEditing}
            />
            {validationErrors?.description && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>
          <DatePicker
            value={formData.endDate}
            onChange={(value) => handleInputChange("endDate", value)}
            label="End date"
            disabled={!isEditing}
            isLoading={isLoading}
            error={validationErrors?.endDate}
            minDate={new Date(new Date().setHours(0, 0, 0, 0))}
          />
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
            variant={isEditing ? "secondary" : "primary"}
            onClick={handleSubmit}
            disabled={isLoading || !isEditing}
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