"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { biddingAPI } from "../services/api";
import { toast } from "sonner";
import type {
  PlaceBidRequest,
  PlaceBidResponse,
  AuctionError,
  BidFormData,
  FormValidationErrors,
  DetailedAuctionResponse,
} from "../types/auction";

interface PlaceBidMutationVariables {
  formData: BidFormData;
}

const BID_VALIDATION = {
  MIN_INCREMENT: 1,
  MAX_AMOUNT: 999999.99,
  MAX_DECIMAL_PLACES: 2,
} as const;

const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)}€`;
};

const showValidationErrorToast = (validationErrors: FormValidationErrors): void => {
  const fieldMessages = Object.values(validationErrors).filter(Boolean);

  if (fieldMessages.length > 0) {
    toast.error('Bid Validation Failed', {
      description: fieldMessages[0],
      duration: 8000,
    });
  } else {
    toast.error('Bid Validation Failed', {
      description: 'Please check your bid amount and try again.',
      duration: 8000,
    });
  }
};

const validateBidAmount = (amount: number, currentPrice: number): string | null => {
  if (amount <= currentPrice) {
    return `Bid must be higher than current price (${formatCurrency(currentPrice)})`;
  }

  if (amount < currentPrice + BID_VALIDATION.MIN_INCREMENT) {
    return `Minimum bid is ${formatCurrency(currentPrice + BID_VALIDATION.MIN_INCREMENT)} (minimum increment: ${formatCurrency(BID_VALIDATION.MIN_INCREMENT)})`;
  }

  if (amount > BID_VALIDATION.MAX_AMOUNT) {
    return `Bid amount must be less than ${formatCurrency(BID_VALIDATION.MAX_AMOUNT)}`;
  }

  return null;
};

const validateBidForm = (formData: BidFormData, currentPrice: number): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.amount?.trim()) {
    errors.amount = "Bid amount is required";
    return errors;
  }

  const amountStr = formData.amount.trim();

  if (!/^-?\d*\.?\d*$/.test(amountStr)) {
    errors.amount = "Bid amount must be a valid number (e.g., 10.50)";
    return errors;
  }

  const amount = Number.parseFloat(amountStr);
  if (Number.isNaN(amount)) {
    errors.amount = "Bid amount must be a valid number";
    return errors;
  }

  const decimalParts = amountStr.split('.');
  if (decimalParts[1]?.length > BID_VALIDATION.MAX_DECIMAL_PLACES) {
    errors.amount = `Bid amount can have maximum ${BID_VALIDATION.MAX_DECIMAL_PLACES} decimal places`;
    return errors;
  }

  const amountError = validateBidAmount(amount, currentPrice);
  if (amountError) {
    errors.amount = amountError;
  }

  return errors;
};

const convertFormDataToRequest = (formData: BidFormData): PlaceBidRequest => ({
  amount: Number.parseFloat(formData.amount),
});

export function usePlaceBid(auctionId: string, initialCurrentPrice: number, auction?: DetailedAuctionResponse) {
  const queryClient = useQueryClient();

  const placeBidMutation = useMutation<
    PlaceBidResponse | { validationErrors: FormValidationErrors },
    AuctionError,
    PlaceBidMutationVariables
  >({
    mutationFn: async ({ formData }) => {
      const requestData = convertFormDataToRequest(formData);
      return await biddingAPI.placeBid(auctionId, requestData);
    },
    onMutate: async ({ formData }) => {
      await queryClient.cancelQueries({ queryKey: ["auction", auctionId] });
      await queryClient.cancelQueries({ queryKey: ["auctions"] });

      const previousAuction = queryClient.getQueryData(["auction", auctionId]);
      const previousAuctions = queryClient.getQueryData(["auctions"]);

      const newPrice = Number.parseFloat(formData.amount);

      queryClient.setQueryData(["auction", auctionId], (old: any) => ({
        ...old,
        currentPrice: newPrice,
        status: old.status === 'IN_PROGRESS' ? 'WINNING' : old.status,
      }));

      // Optimistically update auctions list if it exists
      const oldAuctions = queryClient.getQueryData(["auctions"]);
      if (oldAuctions && typeof oldAuctions === 'object' && 'auctions' in oldAuctions && Array.isArray(oldAuctions.auctions)) {
        queryClient.setQueryData(["auctions"], (old: any) => ({
          ...old,
          auctions: old.auctions.map((auctionItem: any) =>
            auctionItem.id === auctionId
              ? {
                  ...auctionItem,
                  currentPrice: newPrice,
                  price: formatCurrency(newPrice),
                  status: auctionItem.status === 'IN_PROGRESS' ? 'WINNING' : auctionItem.status,
                }
              : auctionItem
          ),
        }));
      }

      return { previousAuction, previousAuctions };
    },
    onSuccess: (data) => {
      if ('validationErrors' in data) {
        showValidationErrorToast(data.validationErrors);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["auction", auctionId], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["auctions"], refetchType: "active" });
      queryClient.invalidateQueries({ queryKey: ["user-statistics"], refetchType: "active" });
    },
    onError: (error, variables, context: any) => {
      console.error('💥 [usePlaceBid] Error placing bid:', error);

      // Rollback optimistic updates on error
      if (context?.previousAuction) {
        queryClient.setQueryData(["auction", auctionId], context.previousAuction);
      }
      if (context?.previousAuctions) {
        queryClient.setQueryData(["auctions"], context.previousAuctions);
      }
    },
  });

  const placeBid = async (formData: BidFormData): Promise<PlaceBidResponse> => {
    const currentPrice = auction?.currentPrice || initialCurrentPrice;
    const validationErrors = validateBidForm(formData, currentPrice);

    if (Object.keys(validationErrors).length > 0) {
      showValidationErrorToast(validationErrors);
      const error: AuctionError = {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: validationErrors,
      };
      throw error;
    }

    const result = await placeBidMutation.mutateAsync({ formData });

    if ('validationErrors' in result) {
      showValidationErrorToast(result.validationErrors);
      const error: AuctionError = {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: result.validationErrors,
      };
      throw error;
    }

    return result;
  };

  
  
  return {
    placeBid,
    isLoading: placeBidMutation.isPending,
    error: placeBidMutation.error,
  };
}