"use client";

import { useQuery } from "@tanstack/react-query";
import { auctionsAPI } from "../services/api";
import { AuctionData, AuctionFilter } from "../components/ui/auction-tab-content";

interface UseAuctionsQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

// Helper functions to transform API data
function mapApiStatusToCardStatus(apiStatus: string): AuctionData["status"] {
  switch (apiStatus) {
    case "IN_PROGRESS":
      return "in-progress";
    case "DONE":
      return "done";
    case "OUTBID":
      return "outbid";
    case "WINNING":
      return "winning";
    default:
      return "in-progress";
  }
}

function formatTimeLeft(endTime: string): string {
  const endTimeDate = new Date(endTime).getTime();
  const now = new Date().getTime();
  const diff = endTimeDate - now;

  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m`;
  }
}

// Transform API response to our AuctionData format
function transformAuctionData(response: any): AuctionData[] {
  if (!response?.auctions) return [];

  return response.auctions.map((item: any) => ({
    id: item.id,
    title: item.title,
    price: `${item.currentPrice} €`,
    status: mapApiStatusToCardStatus(item.status),
    timeLeft: formatTimeLeft(item.endTime),
    imageUrl: item.imageUrl,
    sellerId: item.sellerId
  }));
}

export function useAuctionsQuery(
  filter: AuctionFilter,
  page = 1,
  limit = 50,
  options: UseAuctionsQueryOptions = {}
) {
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options;

  console.log(`🔍 [useAuctionsQuery] Initializing query for filter: ${filter}, page: ${page}, limit: ${limit}, enabled: ${enabled}`);

  return useQuery({
    queryKey: ["auctions", filter, page, limit],
    queryFn: async () => {
      console.log(`📡 [useAuctionsQuery] Fetching auctions - Filter: ${filter}, Page: ${page}, Limit: ${limit}`);

      try {
        const response = await auctionsAPI.getAuctions(filter, page, limit);

        console.log(`📊 [useAuctionsQuery] API Response received:`, {
          filter,
          page,
          limit,
          response: {
            auctionsCount: response?.auctions?.length || 0,
            pagination: response?.pagination,
            totalAuctions: response?.pagination?.total || 0,
            totalPages: response?.pagination?.totalPages || 0
          }
        });

        const transformedData = {
          auctions: transformAuctionData(response),
          pagination: response.pagination || {
            page: page,
            limit: limit,
            total: 0,
            totalPages: 0
          }
        };

        console.log(`✨ [useAuctionsQuery] Data transformation complete:`, {
          filter,
          transformedAuctionsCount: transformedData.auctions.length,
          sampleAuction: transformedData.auctions[0] || null
        });

        return transformedData;
      } catch (error) {
        console.error(`❌ [useAuctionsQuery] API Error for filter: ${filter}:`, error);
        throw error;
      }
    },
    enabled,
    staleTime,
    retry: (failureCount, error) => {
      console.log(`🔄 [useAuctionsQuery] Retry attempt ${failureCount} for filter: ${filter}`, error);

      // Don't retry on 404 or 401 errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
          console.log(`🚫 [useAuctionsQuery] Not retrying - status ${axiosError.response?.status}`);
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000)
  });
}

// Hook for prefetching auction data (used for background loading)
export function usePrefetchAuctions() {
  return async (filter: AuctionFilter, page = 1, limit = 20) => {
    // This will be used with QueryClient to prefetch data
    // Implementation will be added when we integrate with the profile page
  };
}