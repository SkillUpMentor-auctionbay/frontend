"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsAPI } from "../services/api";
import {
  CreateAuctionRequest,
  CreateAuctionResponse,
  AuctionError,
  AuctionFormData,
  FormValidationErrors,
  ValidationError
} from "../types/auction";

// Date parsing utility for European date format (DD.MM.YYYY)
const parseEuropeanDate = (dateString: string): Date | null => {
  // Remove any whitespace and check if the string is empty
  const trimmedDate = dateString.trim();
  if (!trimmedDate) return null;

  // Validate DD.MM.YYYY format
  const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  if (!regex.test(trimmedDate)) return null;

  const [, day, month, year] = trimmedDate.match(regex)!;

  // Create date using noon UTC to avoid timezone issues
  const date = new Date(`${year}-${month}-${day}T12:00:00Z`);

  // Additional validation: check if the constructed date is valid
  if (isNaN(date.getTime())) return null;

  // Check if the date components match (e.g., February 30th would be adjusted to March 2nd)
  const constructedDay = parseInt(day, 10);
  const constructedMonth = parseInt(month, 10);
  const constructedYear = parseInt(year, 10);

  if (date.getUTCDate() !== constructedDay ||
      date.getUTCMonth() + 1 !== constructedMonth ||
      date.getUTCFullYear() !== constructedYear) {
    return null;
  }

  return date;
};

// Validation functions
const validateAuctionForm = (formData: AuctionFormData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  // Title validation
  if (!formData.title || formData.title.trim().length === 0) {
    errors.title = "Title is required";
  } else if (formData.title.trim().length > 200) {
    errors.title = "Title must be less than 200 characters";
  }

  // Description validation
  if (!formData.description || formData.description.trim().length === 0) {
    errors.description = "Description is required";
  } else if (formData.description.trim().length > 2000) {
    errors.description = "Description must be less than 2000 characters";
  }

  // Starting price validation
  if (!formData.startingPrice || formData.startingPrice.trim().length === 0) {
    errors.startingPrice = "Starting price is required";
  } else {
    const priceStr = formData.startingPrice.trim();

    // Check if the input contains only numbers, decimal point, and optional negative sign
    if (!/^-?\d*\.?\d*$/.test(priceStr)) {
      errors.startingPrice = "Starting price must be a valid number (e.g., 10.50)";
    } else {
      const price = parseFloat(priceStr);
      if (isNaN(price)) {
        errors.startingPrice = "Starting price must be a valid number";
      } else if (price <= 0) {
        errors.startingPrice = "Starting price must be positive";
      } else if (price > 999999.99) {
        errors.startingPrice = "Starting price must be less than 1,000,000";
      } else {
        // Check for max 2 decimal places
        const decimalPlaces = priceStr.split('.')[1];
        if (decimalPlaces && decimalPlaces.length > 2) {
          errors.startingPrice = "Starting price can have maximum 2 decimal places";
        }
      }
    }
  }

  // End date validation
  if (!formData.endDate || formData.endDate.trim().length === 0) {
    errors.endDate = "End date is required";
  } else {
    const endDate = parseEuropeanDate(formData.endDate);
    const now = new Date();

    if (!endDate) {
      errors.endDate = "Use DD.MM.YYYY format (e.g., 10.12.2025)";
    } else if (endDate <= now) {
      errors.endDate = "End date must be in the future";
    }
  }

  // Image validation (optional)
  if (formData.image) {
    // File size validation (5MB max)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (formData.image.size > maxSizeInBytes) {
      errors.image = "Image must be less than 5MB";
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(formData.image.type)) {
      errors.image = "Image must be in JPEG, JPG, PNG, or WebP format";
    }
  }

  return errors;
};

const convertFormDataToRequest = (formData: AuctionFormData): CreateAuctionRequest => {
  // Convert European date format to ISO string
  const endDate = parseEuropeanDate(formData.endDate);

  if (!endDate) {
    throw new Error("Invalid date format. Please use DD.MM.YYYY format.");
  }

  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    startingPrice: parseFloat(formData.startingPrice),
    endTime: endDate.toISOString(),
    // imageUrl will be set after image upload if provided
  };
};

export function useCreateAuction() {
  const queryClient = useQueryClient();

  const createAuctionMutation = useMutation<
    CreateAuctionResponse | { validationErrors: FormValidationErrors },
    AuctionError,
    { formData: AuctionFormData }
  >({
    mutationFn: async ({ formData }) => {
      // Validate form data first
      const validationErrors = validateAuctionForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        // Return validation errors instead of throwing
        return { validationErrors };
      }

      // Convert form data to API request format
      const requestData = convertFormDataToRequest(formData);

      console.log(`🚀 [useCreateAuction] Creating auction with data:`, {
        title: requestData.title,
        startingPrice: requestData.startingPrice,
        endTime: requestData.endTime,
        hasImage: !!formData.image,
        timestamp: new Date().toISOString()
      });

      try {
        // Create auction first
        const createResponse = await auctionsAPI.createAuction(requestData);

        // If image is provided, upload it
        if (formData.image) {
          console.log(`📸 [useCreateAuction] Uploading image for auction ${createResponse.auction.id}`);
          await auctionsAPI.uploadAuctionImage(createResponse.auction.id, formData.image);
        }

        console.log(`✅ [useCreateAuction] Auction creation complete:`, {
          auctionId: createResponse.auction.id,
          title: createResponse.auction.title,
          hadImage: !!formData.image,
          timestamp: new Date().toISOString()
        });

        return createResponse;
      } catch (error) {
        console.error(`❌ [useCreateAuction] Failed to create auction:`, {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          errorDetails: error && typeof error === 'object' ? error : undefined,
          timestamp: new Date().toISOString()
        });

        // Ensure we're throwing a proper AuctionError
        if (error && typeof error === 'object' && 'message' in error) {
          throw error as AuctionError;
        } else if (error instanceof Error) {
          const auctionError: AuctionError = {
            message: error.message,
            code: 'UNKNOWN_ERROR'
          };
          throw auctionError;
        } else {
          const auctionError: AuctionError = {
            message: 'An unexpected error occurred while creating the auction',
            code: 'UNKNOWN_ERROR'
          };
          throw auctionError;
        }
      }
    },
    onSuccess: (data) => {
      // Check if this is a validation error response
      if ('validationErrors' in data) {
        console.log(`⚠️ [useCreateAuction] Validation failed:`, {
          validationErrors: data.validationErrors,
          timestamp: new Date().toISOString()
        });
        // Don't throw errors - just log them for debugging
        return;
      }

      // This is a successful auction creation
      console.log(`🎉 [useCreateAuction] Auction created successfully:`, {
        auctionId: data.auction.id,
        title: data.auction.title,
        timestamp: new Date().toISOString()
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["auctions"],
        refetchType: "active"
      });

      // Specifically invalidate OWN auctions since user just created one
      queryClient.invalidateQueries({
        queryKey: ["auctions", "OWN"],
        refetchType: "active"
      });

      // Invalidate user statistics to refresh the statistics cards
      queryClient.invalidateQueries({
        queryKey: ["user-statistics"],
        refetchType: "active"
      });
    },
    onError: (error) => {
      console.error(`💥 [useCreateAuction] Error creating auction:`, {
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString()
      });
    },
  });

  const createAuction = async (formData: AuctionFormData): Promise<CreateAuctionResponse> => {
    const result = await createAuctionMutation.mutateAsync({ formData });

    // Check if this is a validation error response
    if ('validationErrors' in result) {
      // Return a mock error response that will be handled by the UI
      const error: AuctionError = {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: result.validationErrors
      };
      throw error;
    }

    return result as CreateAuctionResponse;
  };

  // Helper function to extract validation errors from both mutation data and errors
  const getValidationErrors = (formData?: AuctionFormData): FormValidationErrors => {
    // If we have validation errors in the mutation data (from successful validation), use them
    if (createAuctionMutation.data && 'validationErrors' in createAuctionMutation.data) {
      return createAuctionMutation.data.validationErrors;
    }

    // Check if we have validation errors in the mutation error
    if (createAuctionMutation.error?.code === "VALIDATION_ERROR" && createAuctionMutation.error.details) {
      return createAuctionMutation.error.details as FormValidationErrors;
    }

    // Check for general errors
    if (createAuctionMutation.error) {
      return { general: createAuctionMutation.error.message };
    }

    return {};
  };

  // Check if there are any validation errors
  const hasValidationErrors = Object.keys(getValidationErrors()).length > 0;

  // Function to clear specific validation errors
  const clearValidationErrors = (fields?: (keyof FormValidationErrors)[]) => {
    if (!fields) {
      // Clear all errors
      createAuctionMutation.reset();
    }
    // Note: We can't selectively clear specific field errors from mutation data
    // This will be handled in the component state instead
  };

  return {
    createAuction,
    isLoading: createAuctionMutation.isPending,
    error: createAuctionMutation.error,
    validationErrors: getValidationErrors(),
    hasValidationErrors,
    reset: createAuctionMutation.reset,
    clearValidationErrors,
  };
}