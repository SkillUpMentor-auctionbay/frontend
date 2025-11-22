"use client";

import { useQuery } from "@tanstack/react-query";
import { auctionsAPI } from "../services/api";
import { DetailedAuctionResponse } from "../types/auction";

interface UseAuctionDetailQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}

export function useAuctionDetailQuery(
  auctionId: string,
  options: UseAuctionDetailQueryOptions = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes for auction details (since we have client-side timer)
    refetchInterval = 10 * 1000 // Refetch every 10 seconds for price/bid updates (matches auction cards)
  } = options;

  return useQuery({
    queryKey: ["auction", auctionId],
    queryFn: async (): Promise<DetailedAuctionResponse> => {
      try {
        const response = await auctionsAPI.getAuctionById(auctionId);
        return response;
      } catch (error) {
        throw error;
      }
    },
    enabled: enabled && !!auctionId,
    staleTime,
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          return false; // Don't retry on not found
        }
        if (axiosError.response?.status === 401) {
          return false; // Don't retry on unauthorized
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000)
  });
}
