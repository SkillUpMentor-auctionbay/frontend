"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsAPI } from "@/services/api";
import {
  UpdateAuctionRequest,
  UpdateAuctionResponse,
  AuctionError,
  EditAuctionFormData,
  FormValidationErrors,
} from "../types/auction";
import { validateEditAuctionForm } from "@/utils/auctionValidation";
import { normalizeAuctionError } from "@/utils/errorUtils";
import { createMidnightUTCDate } from "@/utils/dateUtils";
import { AUCTION_VALIDATION } from "@/constants/validation";

function convertEditFormDataToRequest(formData: EditAuctionFormData, originalAuctionData?: any): UpdateAuctionRequest {
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
    const endDate = createMidnightUTCDate(formData.endDate);
    if (endDate) {
      const endDateISO = endDate.toISOString();
      if (endDateISO !== originalAuctionData?.endTime) {
        updateData.endTime = endDateISO;
      }
    } else {
      throw new Error(AUCTION_VALIDATION.MESSAGES.INVALID_DATE_FORMAT);
    }
  }

  if (formData.existingImageUrl === undefined) {
    updateData.imageUrl = "";
  }

  return updateData;
}


export function useEditAuction() {
  const queryClient = useQueryClient();

  const editAuctionMutation = useMutation<UpdateAuctionResponse, AuctionError, { auctionId: string; formData: EditAuctionFormData; originalAuctionData?: any }>({
    mutationFn: async ({ auctionId, formData, originalAuctionData }) => {
      const validationErrors = validateEditAuctionForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        const error: AuctionError = {
          message: AUCTION_VALIDATION.MESSAGES.VALIDATION_FAILED,
          code: 'VALIDATION_ERROR',
          details: validationErrors
        };
        throw error;
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
        throw normalizeAuctionError(error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auctions"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["auctions", "OWN"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["auctions", "ALL"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["user-statistics"], refetchType: "active" });
    },
  });

  const editAuction = async (auctionId: string, formData: EditAuctionFormData, originalAuctionData?: any): Promise<UpdateAuctionResponse> => {
    return await editAuctionMutation.mutateAsync({ auctionId, formData, originalAuctionData });
  };

  const getValidationErrors = (): FormValidationErrors => {
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