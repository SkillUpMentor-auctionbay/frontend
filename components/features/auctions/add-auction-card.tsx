"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { InputField } from "@/components/ui/primitives/input";
import { TextAreaField } from "@/components/ui/primitives/textarea-field";
import { useCreateAuction } from "@/hooks/useCreateAuction";
import { AuctionFormData, FormValidationErrors } from "@/types/auction";
import { createMidnightUTCDate } from "@/utils/dateUtils";

export interface AddAuctionCardProps {
  className?: string;
  onSubmit?: (data: AuctionFormData) => void;
  onCancel?: () => void;
}


const AddAuctionCard = React.forwardRef<HTMLDivElement, AddAuctionCardProps>(
  ({ className, onSubmit, onCancel, ...props }, ref) => {
    const { createAuction, isLoading, error, validationErrors, hasValidationErrors, reset } = useCreateAuction();

    const [formData, setFormData] = React.useState<AuctionFormData>({
      title: "",
      description: "",
      startingPrice: "",
      endDate: "",
    });
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [hiddenValidationErrors, setHiddenValidationErrors] = React.useState<Set<string>>(new Set());
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleInputChange = (field: keyof AuctionFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      if (hasValidationErrors) {
        const newValue = value.trim();
        let shouldClearForThisField = false;

        switch (field) {
          case 'title':
            shouldClearForThisField = newValue.length > 0 && newValue.length <= 200;
            break;
          case 'description':
            shouldClearForThisField = newValue.length > 0 && newValue.length <= 2000;
            break;
          case 'startingPrice':
            {
              const priceStr = value.trim();
              const price = Number.parseFloat(priceStr);
              shouldClearForThisField = priceStr.length > 0 &&
                                    /^-?\d*\.?\d*$/.test(priceStr) &&
                                    !Number.isNaN(price) &&
                                    price > 0 &&
                                    price <= 999999.99;
              break;
            }
          case 'endDate':
            { 
              const endDate = createMidnightUTCDate(value);
              shouldClearForThisField = !!endDate && endDate > new Date();
              break;
            }
        }

        if (shouldClearForThisField) {
          setHiddenValidationErrors(prev => new Set([...prev, field]));
        }
      }
    };

    const handleImageChange = (file?: File) => {
      if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageChange(file);
      }
    };

    const handleSubmit = async () => {
      await createAuction(formData);

      setFormData({
        title: "",
        description: "",
        startingPrice: "",
        endDate: "",
      });
      setImagePreview(null);

      if (onSubmit) {
        onSubmit(formData);
      }
    };

    const visibleValidationErrors = React.useMemo(() => {
      const errors: FormValidationErrors = {};
      
      for (const key of Object.keys(validationErrors)) {
        if (!hiddenValidationErrors.has(key)) {
          errors[key as keyof FormValidationErrors] = validationErrors[key as keyof FormValidationErrors];
        }
      }
      return errors;
    }, [validationErrors, hiddenValidationErrors]);

    React.useEffect(() => {
      if (hasValidationErrors) {
        setHiddenValidationErrors(new Set());
      }
    }, [hasValidationErrors]);

    React.useEffect(() => {
      if (error && !hasValidationErrors) {
        reset();
      }
    }, [formData, error, hasValidationErrors, reset]);

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-2xl p-4 flex flex-col gap-4 w-full max-w-[533px]",
          className
        )}
        {...props}
      >
        <div>
          <div className="bg-background rounded-2xl h-[168px] flex flex-col items-center justify-center relative overflow-hidden">
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img
                  src={imagePreview}
                  alt="Auction preview"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <Button
                  variant="secondary"
                  leftIcon="Delete"
                  iconSize={16}
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, image: undefined }));
                  }}
                />

              </div>
            ) : (
              <Button
                variant="tertiary"
                onClick={() => fileInputRef.current?.click()}
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
            />
          </div>
          {visibleValidationErrors?.image && (
            <p className="text-red-500 text-sm mt-1">{visibleValidationErrors.image}</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <InputField
              label="Title"
              placeholder="Write item name here"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={cn(
                visibleValidationErrors?.title && "border-red-500 focus:border-red-500"
              )}
            />
            {visibleValidationErrors?.title && (
              <p className="text-red-500 text-sm mt-1">{visibleValidationErrors.title}</p>
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
            {visibleValidationErrors?.description && (
              <p className="text-red-500 text-sm mt-1">{visibleValidationErrors.description}</p>
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
                    visibleValidationErrors?.startingPrice && "border-red-500 focus:border-red-500"
                  )}
                />
                {visibleValidationErrors?.startingPrice && (
                  <p className="text-red-500 text-sm mt-1">{visibleValidationErrors.startingPrice}</p>
                )}
              </div>

              <div>
                <InputField
                  label="End date"
                  type="text"
                  placeholder="dd.mm.yyyy"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  rightIcon="Time"
                  rightIconClickable={false}
                  className={cn(
                    "w-42",
                    visibleValidationErrors?.endDate && "border-red-500 focus:border-red-500"
                  )}
                />
                {visibleValidationErrors?.endDate && (
                  <p className="text-red-500 text-sm mt-1">{visibleValidationErrors.endDate}</p>
                )}
              </div>
          </div>

        {visibleValidationErrors?.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm font-medium">{visibleValidationErrors.general}</p>
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
          >
            {isLoading ? "Creating..." : "Start auction"}
          </Button>
        </div>
        </div>
      </div>
    );
  }
);

AddAuctionCard.displayName = "AddAuctionCard";

export { AddAuctionCard };