"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export interface UserStatistics {
  totalEarnings: number;
  totalPostedAuctions: number;
  currentlyBidding: number;
  currentlyWinning: number;
}

interface UseUserStatisticsOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useUserStatistics(options: UseUserStatisticsOptions = {}, isAuthenticated?: boolean, isLoggingOut?: boolean) {
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options;

  // Disable the query if user is not authenticated or is logging out
  const queryEnabled = enabled && !!isAuthenticated && !isLoggingOut;

  console.log(`📊 [useUserStatistics] Initializing statistics query - enabled: ${enabled}, isAuthenticated: ${isAuthenticated}, isLoggingOut: ${isLoggingOut}, queryEnabled: ${queryEnabled}`);

  return useQuery<UserStatistics, Error>({
    queryKey: ["user-statistics"],
    queryFn: async () => {
      console.log(`📡 [useUserStatistics] Fetching user statistics`);

      try {
        const response = await api.get("/api/v1/users/me/statistics");

        console.log(`📥 [useUserStatistics] Statistics API Response:`, {
          totalEarnings: response.data.totalEarnings,
          totalPostedAuctions: response.data.totalPostedAuctions,
          currentlyBidding: response.data.currentlyBidding,
          currentlyWinning: response.data.currentlyWinning,
          responseTime: new Date().toISOString()
        });

        return response.data;
      } catch (error) {
        console.error(`❌ [useUserStatistics] API Error:`, error);
        throw error;
      }
    },
    enabled: queryEnabled,
    staleTime,
    retry: (failureCount, error) => {
      console.log(`🔄 [useUserStatistics] Retry attempt ${failureCount}`, error);

      // Don't retry on 401 or 403 errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          console.log(`🚫 [useUserStatistics] Not retrying - status ${axiosError.response?.status}`);
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

// Hook for prefetching statistics (used for background loading)
export function usePrefetchUserStatistics() {
  const queryClient = useQueryClient();

  const prefetchStatistics = () => {
    queryClient.prefetchQuery({
      queryKey: ["user-statistics"],
      queryFn: async () => {
        const response = await api.get("/api/v1/users/me/statistics");
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return { prefetchStatistics };
}