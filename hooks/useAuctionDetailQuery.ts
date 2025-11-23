"use client";

import { useQuery } from "@tanstack/react-query";
import { auctionsAPI } from "../services/api";
import { QUERY_CONSTANTS } from "../constants/query";

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
    staleTime = QUERY_CONSTANTS.CACHE_TIMES.MEDIUM,
    refetchInterval = QUERY_CONSTANTS.REFRESH_INTERVALS.NORMAL
  } = options;

  return useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => auctionsAPI.getAuctionById(auctionId),
    enabled: enabled && !!auctionId,
    staleTime,
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as any).response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < QUERY_CONSTANTS.RETRY.MAX_ATTEMPTS;
    },
    retryDelay: (attemptIndex) =>
      Math.min(QUERY_CONSTANTS.RETRY.BASE_DELAY * 2 ** attemptIndex, QUERY_CONSTANTS.RETRY.MAX_DELAY)
  });
}
