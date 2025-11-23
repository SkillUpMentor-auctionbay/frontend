"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "../services/api";

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

const DEFAULT_STATISTICS: UserStatistics = {
  totalEarnings: 0,
  totalPostedAuctions: 0,
  currentlyBidding: 0,
  currentlyWinning: 0,
};

const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000,
  GC_TIME: 10 * 60 * 1000,
  RETRY_COUNT: 1,
  RETRY_DELAY: 2000,
} as const;

const validateStatisticsData = (data: any): UserStatistics => {
  const safeData = data || {};
  return {
    totalEarnings: typeof safeData.totalEarnings === 'number' ? safeData.totalEarnings : 0,
    totalPostedAuctions: typeof safeData.totalPostedAuctions === 'number' ? safeData.totalPostedAuctions : 0,
    currentlyBidding: typeof safeData.currentlyBidding === 'number' ? safeData.currentlyBidding : 0,
    currentlyWinning: typeof safeData.currentlyWinning === 'number' ? safeData.currentlyWinning : 0,
  };
};

const shouldRetry = (failureCount: number, error: any): boolean => {
  if (failureCount >= QUERY_CONFIG.RETRY_COUNT) {
    return false;
  }

  if (error?.response?.status === 401 ||
      error?.response?.status === 403 ||
      error?.response?.status >= 500) {
    return false;
  }

  return true;
};

const logError = (error: unknown): void => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.warn('Statistics API failed, using default values:', message);
};

const statisticsAPI = {
  async fetch(): Promise<UserStatistics> {
    const data = await userAPI.getStatistics();
    return validateStatisticsData(data);
  },

  async fetchWithFallback(): Promise<UserStatistics> {
    try {
      return await statisticsAPI.fetch();
    } catch (error) {
      logError(error);
      return DEFAULT_STATISTICS;
    }
  },
};

export const useUserStatistics = (
  options: UseUserStatisticsOptions = {},
  isAuthenticated?: boolean,
  isLoggingOut?: boolean
) => {
  const { enabled = true, staleTime = QUERY_CONFIG.STALE_TIME } = options;
  const queryEnabled = enabled && !!isAuthenticated && !isLoggingOut;

  return useQuery<UserStatistics, Error>({
    queryKey: ["user-statistics"],
    queryFn: statisticsAPI.fetchWithFallback,
    enabled: queryEnabled,
    staleTime,
    retry: shouldRetry,
    retryDelay: QUERY_CONFIG.RETRY_DELAY,
    gcTime: QUERY_CONFIG.GC_TIME,
  });
};

export const usePrefetchUserStatistics = () => {
  const queryClient = useQueryClient();

  const prefetchStatistics = () => {
    queryClient.prefetchQuery({
      queryKey: ["user-statistics"],
      queryFn: statisticsAPI.fetchWithFallback,
      staleTime: QUERY_CONFIG.STALE_TIME,
      retry: false,
    });
  };

  return { prefetchStatistics };
};