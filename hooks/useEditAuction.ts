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
    const endDate = new Date(formData.endDate);
    const now = new Date();

    if (isNaN(endDate.getTime())) {
      errors.endDate = "End date must be a valid date";
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
    const endDateISO = new Date(formData.endDate).toISOString();
    if (endDateISO !== originalAuctionData?.endTime) {
      updateData.endTime = endDateISO;
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