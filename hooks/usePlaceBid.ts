"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { biddingAPI } from "../services/api";
import {
  PlaceBidRequest,
  PlaceBidResponse,
  AuctionError,
  BidFormData,
  FormValidationErrors,
  DetailedAuctionResponse,
} from "../types/auction";

// Validation functions
const validateBidForm = (formData: BidFormData, currentPrice: number): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  // Amount validation
  if (!formData.amount || formData.amount.trim().length === 0) {
    errors.amount = "Bid amount is required";
  } else {
    const amountStr = formData.amount.trim();

    // Check if the input contains only numbers, decimal point, and optional negative sign
    if (!/^-?\d*\.?\d*$/.test(amountStr)) {
      errors.amount = "Bid amount must be a valid number (e.g., 10.50)";
    } else {
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) {
        errors.amount = "Bid amount must be a valid number";
      } else if (amount <= currentPrice) {
        errors.amount = `Bid must be higher than current price (${currentPrice.toFixed(2)}€)`;
      } else if (amount < currentPrice + 1.00) {
        errors.amount = `Minimum bid is ${(currentPrice + 1.00).toFixed(2)}€ (minimum increment: 1.00€)`;
      } else if (amount > 999999.99) {
        errors.amount = "Bid amount must be less than 1,000,000";
      } else {
        // Check for max 2 decimal places
        const decimalPlaces = amountStr.split('.')[1];
        if (decimalPlaces && decimalPlaces.length > 2) {
          errors.amount = "Bid amount can have maximum 2 decimal places";
        }
      }
    }
  }

  return errors;
};

const convertFormDataToRequest = (formData: BidFormData): PlaceBidRequest => {
  return {
    amount: parseFloat(formData.amount),
  };
};

export function usePlaceBid(auctionId: string, initialCurrentPrice: number, auction?: DetailedAuctionResponse) {
  const queryClient = useQueryClient();

  // Pre-validation function that runs before any mutations
  const validateBidBeforeMutation = (formData: BidFormData, originalCurrentPrice: number): FormValidationErrors => {
    console.log(`🔍 [usePlaceBid] Pre-validating bid: amount=${formData.amount}, currentPrice=${originalCurrentPrice}`);

    const validationErrors = validateBidForm(formData, originalCurrentPrice);

    if (Object.keys(validationErrors).length > 0) {
      console.log(`❌ [usePlaceBid] Pre-validation failed:`, validationErrors);
    } else {
      console.log(`✅ [usePlaceBid] Pre-validation passed`);
    }

    return validationErrors;
  };

  const placeBidMutation = useMutation<
    PlaceBidResponse | { validationErrors: FormValidationErrors },
    AuctionError,
    { formData: BidFormData }
  >({
    mutationFn: async ({ formData }) => {
      // Convert form data to API request format
      const requestData = convertFormDataToRequest(formData);

      console.log(`🚀 [usePlaceBid] Placing bid for auction ${auctionId}:`, {
        amount: requestData.amount,
        timestamp: new Date().toISOString()
      });

      try {
        const response = await biddingAPI.placeBid(auctionId, requestData);

        console.log(`✅ [usePlaceBid] Bid placed successfully:`, {
          auctionId,
          bidAmount: response.bid.amount,
          timestamp: new Date().toISOString()
        });

        return response;
      } catch (error) {
        console.error(`❌ [usePlaceBid] Failed to place bid:`, {
          auctionId,
          amount: requestData.amount,
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
            message: 'An unexpected error occurred while placing your bid',
            code: 'UNKNOWN_ERROR'
          };
          throw auctionError;
        }
      }
    },
    onMutate: async ({ formData }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["auction", auctionId] });
      await queryClient.cancelQueries({ queryKey: ["auctions"] });

      // Snapshot the previous value for rollback
      const previousAuction = queryClient.getQueryData(["auction", auctionId]);
      const previousAuctions = queryClient.getQueryData(["auctions"]);

      // Optimistically update auction details with new bid amount
      if (previousAuction && typeof previousAuction === 'object' && 'currentPrice' in previousAuction) {
        console.log(`🔄 [usePlaceBid] Optimistically updating auction price from ${previousAuction.currentPrice} to ${formData.amount}`);
        queryClient.setQueryData(["auction", auctionId], (old: any) => ({
          ...old,
          currentPrice: parseFloat(formData.amount),
          // Assume user is winning after placing bid
          status: old.status === 'IN_PROGRESS' ? 'WINNING' : old.status
        }));
      }

      // Optimistically update auction in list
      if (previousAuctions && typeof previousAuctions === 'object' && 'auctions' in previousAuctions) {
        queryClient.setQueryData(["auctions"], (old: any) => ({
          ...old,
          auctions: old.auctions.map((auction: any) =>
            auction.id === auctionId
              ? {
                  ...auction,
                  currentPrice: parseFloat(formData.amount),
                  price: `${parseFloat(formData.amount).toFixed(2)} €`,
                  status: auction.status === 'IN_PROGRESS' ? 'WINNING' : auction.status
                }
              : auction
          )
        }));
      }

      // Return a context with our snapshotted values
      return { previousAuction, previousAuctions };
    },
    onSuccess: (data) => {
      // Check if this is a validation error response
      if ('validationErrors' in data) {
        console.log(`⚠️ [usePlaceBid] Validation failed:`, {
          validationErrors: data.validationErrors,
          timestamp: new Date().toISOString()
        });
        // Don't throw errors - just log them for debugging
        return;
      }

      // This is a successful bid placement
      console.log(`🎉 [usePlaceBid] Bid placed successfully:`, {
        auctionId,
        bidAmount: data.bid.amount,
        timestamp: new Date().toISOString()
      });

      // Invalidate relevant queries to refresh data and confirm optimistic updates
      queryClient.invalidateQueries({
        queryKey: ["auction", auctionId],
        refetchType: "active"
      });

      // Invalidate auctions list to reflect updated prices
      queryClient.invalidateQueries({
        queryKey: ["auctions"],
        refetchType: "active"
      });

      // Invalidate user statistics to refresh bid counts
      queryClient.invalidateQueries({
        queryKey: ["user-statistics"],
        refetchType: "active"
      });
    },
    onError: (error, variables, context: any) => {
      console.error(`💥 [usePlaceBid] Error placing bid:`, {
        auctionId,
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString()
      });

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAuction) {
        queryClient.setQueryData(["auction", auctionId], context.previousAuction);
      }
      if (context?.previousAuctions) {
        queryClient.setQueryData(["auctions"], context.previousAuctions);
      }
    },
  });

  const placeBid = async (formData: BidFormData): Promise<PlaceBidResponse> => {
    // Step 1: Pre-validate the bid using the original auction data
    const originalCurrentPrice = auction?.currentPrice || initialCurrentPrice;
    console.log(`🔄 [usePlaceBid] Starting bid placement with original price: ${originalCurrentPrice}`);

    const validationErrors = validateBidBeforeMutation(formData, originalCurrentPrice);

    if (Object.keys(validationErrors).length > 0) {
      console.log(`❌ [usePlaceBid] Pre-validation failed, returning errors:`, validationErrors);
      // Return a mock error response that will be handled by the UI
      const error: AuctionError = {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: validationErrors
      };
      throw error;
    }

    // Step 2: If validation passes, call the mutation
    console.log(`✅ [usePlaceBid] Pre-validation passed, calling mutation`);
    const result = await placeBidMutation.mutateAsync({ formData });

    // Step 3: Check if the mutation returned validation errors (edge case)
    if ('validationErrors' in result) {
      console.log(`⚠️ [usePlaceBid] Mutation returned validation errors:`, result.validationErrors);
      const error: AuctionError = {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: result.validationErrors
      };
      throw error;
    }

    return result as PlaceBidResponse;
  };

  // Helper function to extract validation errors from both mutation data and errors
  const getValidationErrors = (formData?: BidFormData): FormValidationErrors => {
    // If we have validation errors in the mutation data (from successful validation), use them
    if (placeBidMutation.data && 'validationErrors' in placeBidMutation.data) {
      return placeBidMutation.data.validationErrors;
    }

    // Check if we have validation errors in the mutation error
    if (placeBidMutation.error?.code === "VALIDATION_ERROR" && placeBidMutation.error.details) {
      return placeBidMutation.error.details as FormValidationErrors;
    }

    // Check for general errors
    if (placeBidMutation.error) {
      return { general: placeBidMutation.error.message };
    }

    return {};
  };

  // Check if there are any validation errors
  const hasValidationErrors = Object.keys(getValidationErrors()).length > 0;

  // Function to clear specific validation errors
  const clearValidationErrors = (fields?: (keyof FormValidationErrors)[]) => {
    if (!fields) {
      // Clear all errors
      placeBidMutation.reset();
    }
    // Note: We can't selectively clear specific field errors from mutation data
    // This will be handled in the component state instead
  };

  return {
    placeBid,
    isLoading: placeBidMutation.isPending,
    error: placeBidMutation.error,
    validationErrors: getValidationErrors(),
    hasValidationErrors,
    reset: placeBidMutation.reset,
    clearValidationErrors,
  };
}