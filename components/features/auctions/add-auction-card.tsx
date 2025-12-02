"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { InputField } from "@/components/ui/primitives/input";
import { TextAreaField } from "@/components/ui/primitives/textarea-field";
import { useCreateAuction } from "@/hooks/useCreateAuction";
import { AuctionFormData, AuctionError } from "@/types/auction";
import { AuctionImageUpload } from "./auction-image-upload";
import { useAuctionImage } from "@/hooks/useAuctionImage";
import { useAuctionValidation } from "@/hooks/useAuctionValidation";
import { DatePicker } from "@/components/ui/primitives/date-picker";

export interface AddAuctionCardProps {
  className?: string;
  onSubmit?: (data: AuctionFormData) => void;
  onCancel?: () => void;
}

const AddAuctionCard = React.forwardRef<HTMLDivElement, AddAuctionCardProps>(
  ({ className, onSubmit, onCancel, ...props }, ref) => {
    const { createAuction, isLoading, error, validationErrors, hasValidationErrors } = useCreateAuction();

    const [formData, setFormData] = React.useState<AuctionFormData>({
      title: "",
      description: "",
      startingPrice: "",
      endDate: "",
    });

    const { clearFieldError, validateField } = useAuctionValidation('create');

    // Use shared image hook (no existing image for create)
    const { imageState, handleImageSelect, handleImageDelete } = useAuctionImage();

    const handleInputChange = (field: keyof AuctionFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear validation error for this field when user types
      clearFieldError(field);
    };

    const handleImageChange = (file: File) => {
      handleImageSelect(file);
      setFormData(prev => ({ ...prev, image: file }));
    };

    const handleSubmit = async () => {
      try {
        await createAuction(formData);

        if (onSubmit) {
          onSubmit(formData);
        }
      } catch (error) {
        if ((error as AuctionError)?.code === 'VALIDATION_ERROR') {
          return;
        }
        // For other errors, let them bubble up or handle as needed
        throw error;
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
          validationError={undefined}
          imageError={imageState.error}
          showAddButton={true}
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

          <div className="flex gap-4">
            <div>
              <InputField
                label="Starting price"
                type="number"
                placeholder="Price"
                value={formData.startingPrice}
                onChange={(e) => handleInputChange("startingPrice", e.target.value)}
                rightIcon="Eur"
                rightIconClickable={false}
                className={cn(
                  "w-42",
                  validateField('startingPrice', formData.startingPrice, formData)
                )}
              />
              {validationErrors?.startingPrice && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.startingPrice}</p>
              )}
            </div>

            <DatePicker
              value={formData.endDate}
              onChange={(value) => handleInputChange("endDate", value)}
              label="End date"
              isLoading={isLoading}
              error={validationErrors?.endDate}
              minDate={new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>
        </div>

        {error?.message && !hasValidationErrors && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm font-medium">{error.message}</p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            variant="alternative"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
            className="relative"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Creating...
              </div>
            ) : (
              "Start auction"
            )}
          </Button>
        </div>
      </div>
    );
  }
);

AddAuctionCard.displayName = "AddAuctionCard";

export { AddAuctionCard };