"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsAPI } from "@/services/api";
import {
  CreateAuctionRequest,
  CreateAuctionResponse,
  AuctionError,
  AuctionFormData,
  FormValidationErrors,
} from "../types/auction";
import { validateAuctionForm } from "@/utils/auctionValidation";
import { normalizeAuctionError } from "@/utils/errorUtils";
import { createMidnightUTCDate } from "@/utils/dateUtils";
import { AUCTION_VALIDATION } from "@/constants/validation";


function convertFormDataToRequest(formData: AuctionFormData): CreateAuctionRequest {
  const endDate = createMidnightUTCDate(formData.endDate);

  if (!endDate) {
    throw new Error(AUCTION_VALIDATION.MESSAGES.INVALID_DATE_FORMAT);
  }

  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    startingPrice: Number.parseFloat(formData.startingPrice),
    endTime: endDate.toISOString(),
  };
}

export function useCreateAuction() {
  const queryClient = useQueryClient();

  const createAuctionMutation = useMutation<CreateAuctionResponse, AuctionError, { formData: AuctionFormData }>({
    mutationFn: async ({ formData }) => {
      const validationErrors = validateAuctionForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        const error: AuctionError = {
          message: AUCTION_VALIDATION.MESSAGES.VALIDATION_FAILED,
          code: 'VALIDATION_ERROR',
          details: validationErrors
        };
        throw error;
      }

      const requestData = convertFormDataToRequest(formData);

      try {
        const createResponse = await auctionsAPI.createAuction(requestData);

        if (formData.image) {
          await auctionsAPI.uploadAuctionImage(createResponse.auction.id, formData.image);
        }

        return createResponse;
      } catch (error) {
        throw normalizeAuctionError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["auctions", "OWN"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["user-statistics"], refetchType: "active" });
    }
  });

  const createAuction = async (formData: AuctionFormData): Promise<CreateAuctionResponse> => {
    return await createAuctionMutation.mutateAsync({ formData });
  };

  const getValidationErrors = (): FormValidationErrors => {
    if (createAuctionMutation.error?.code === "VALIDATION_ERROR" && createAuctionMutation.error.details) {
      return createAuctionMutation.error.details as FormValidationErrors;
    }

    if (createAuctionMutation.error) {
      return { general: createAuctionMutation.error.message };
    }

    return {};
  };

  const hasValidationErrors = Object.keys(getValidationErrors()).length > 0;

  return {
    createAuction,
    isLoading: createAuctionMutation.isPending,
    error: createAuctionMutation.error,
    validationErrors: getValidationErrors(),
    hasValidationErrors,
    reset: createAuctionMutation.reset,
  };
}