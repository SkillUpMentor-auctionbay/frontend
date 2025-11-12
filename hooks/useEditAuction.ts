"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsAPI } from "../services/api";
import {
  UpdateAuctionRequest,
  UpdateAuctionResponse,
  AuctionError,
  EditAuctionFormData,
  FormValidationErrors,
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

const validateEditAuctionForm = (formData: EditAuctionFormData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.title || formData.title.trim().length === 0) {
    errors.title = "Title is required";
  } else if (formData.title.trim().length > 200) {
    errors.title = "Title must be less than 200 characters";
  }

  if (!formData.description || formData.description.trim().length === 0) {
    errors.description = "Description is required";
  } else if (formData.description.trim().length > 2000) {
    errors.description = "Description must be less than 2000 characters";
  }

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

  if (formData.image) {
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (formData.image.size > maxSizeInBytes) {
      errors.image = "Image must be less than 5MB";
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(formData.image.type)) {
      errors.image = "Image must be in JPEG, JPG, PNG, or WebP format";
    }
  }

  return errors;
};

const convertEditFormDataToRequest = (formData: EditAuctionFormData, originalAuctionData?: any): UpdateAuctionRequest => {
  const updateData: UpdateAuctionRequest = {};

  if (formData.title?.trim() && formData.title.trim() !== originalAuctionData?.title) {
    updateData.title = formData.title.trim();
  }

  if (formData.description !== undefined && formData.description !== null) {
    const trimmedDescription = formData.description.trim();
    if (trimmedDescription !== (originalAuctionData?.description || "")) {
      updateData.description = trimmedDescription;
    }
  }

  if (formData.endDate) {
    const endDate = parseEuropeanDate(formData.endDate);
    if (endDate) {
      const endDateISO = endDate.toISOString();
      if (endDateISO !== originalAuctionData?.endTime) {
        updateData.endTime = endDateISO;
      }
    }
  }

  if (formData.existingImageUrl === undefined) {
    updateData.imageUrl = "";
  }

  return updateData;
};

export function useEditAuction() {
  const queryClient = useQueryClient();

  const editAuctionMutation = useMutation<
    UpdateAuctionResponse | { validationErrors: FormValidationErrors },
    AuctionError,
    { auctionId: string; formData: EditAuctionFormData; originalAuctionData?: any }
  >({
    mutationFn: async ({ auctionId, formData, originalAuctionData }) => {
      const validationErrors = validateEditAuctionForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        return { validationErrors };
      }

      const requestData = convertEditFormDataToRequest(formData, originalAuctionData);
      
      try {
        const updateResponse = await auctionsAPI.updateAuction(auctionId, requestData);

        if (formData.image) {
          const imageResponse = await auctionsAPI.uploadAuctionImage(auctionId, formData.image);
          updateResponse.auction.imageUrl = imageResponse.imageUrl;
        }

        return updateResponse;
      } catch (error) {
        if (error && typeof error === 'object' && 'message' in error) {
          throw error as AuctionError;
        } else if (error instanceof Error) {
          throw { message: error.message, code: 'UNKNOWN_ERROR' } as AuctionError;
        } else {
          throw { message: 'An unexpected error occurred while updating the auction', code: 'UNKNOWN_ERROR' } as AuctionError;
        }
      }
    },
    onSuccess: (data, variables) => {
      if ('validationErrors' in data) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["auctions"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["auctions", "OWN"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["auctions", "ALL"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["user-statistics"], refetchType: "active" });
    },
  });

  const editAuction = async (auctionId: string, formData: EditAuctionFormData, originalAuctionData?: any): Promise<UpdateAuctionResponse> => {
    const result = await editAuctionMutation.mutateAsync({ auctionId, formData, originalAuctionData });

    if ('validationErrors' in result) {
      const error: AuctionError = {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: result.validationErrors
      };
      throw error;
    }

    return result as UpdateAuctionResponse;
  };

  const getValidationErrors = (): FormValidationErrors => {
    if (editAuctionMutation.data && 'validationErrors' in editAuctionMutation.data) {
      return editAuctionMutation.data.validationErrors;
    }

    if (editAuctionMutation.error?.code === "VALIDATION_ERROR" && editAuctionMutation.error.details) {
      return editAuctionMutation.error.details as FormValidationErrors;
    }

    if (editAuctionMutation.error) {
      return { general: editAuctionMutation.error.message };
    }

    return {};
  };

  const hasValidationErrors = Object.keys(getValidationErrors()).length > 0;

  return {
    editAuction,
    isLoading: editAuctionMutation.isPending,
    error: editAuctionMutation.error,
    validationErrors: getValidationErrors(),
    hasValidationErrors,
    reset: editAuctionMutation.reset,
  };
}