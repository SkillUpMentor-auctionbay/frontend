'use client';

import {
  AuctionData,
  AuctionFilter,
} from '@/components/features/auctions/auction-tab-content';
import { QUERY_CONSTANTS } from '@/constants/query';
import { auctionsAPI } from '@/services/api';
import { AuctionsResponse } from '@/types/auction';
import { formatTimeLeft, isTimeUrgent } from '@/utils/timeUtils';
import { useQuery } from '@tanstack/react-query';

interface UseAuctionsQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}

function mapApiStatusToCardStatus(apiStatus: string): AuctionData['status'] {
  switch (apiStatus) {
    case 'IN_PROGRESS':
      return 'in-progress';
    case 'DONE':
      return 'done';
    case 'OUTBID':
      return 'outbid';
    case 'WINNING':
      return 'winning';
    default:
      return 'in-progress';
  }
}

function transformAuctionData(response: AuctionsResponse): AuctionData[] {
  if (!response?.auctions) return [];

  const transformedAuctions = response.auctions.map((item: any) => {
    const timeLeft = formatTimeLeft(item.endTime);
    const timeIsUrgent = isTimeUrgent(item.endTime);

    return {
      id: item.id,
      title: item.title,
      description: item.description || '',
      startingPrice: item.startingPrice || 0,
      currentPrice: item.currentPrice || 0,
      endTime: item.endTime || new Date().toISOString(),
      imageUrl: item.imageUrl,
      sellerId: item.sellerId || '',
      status: mapApiStatusToCardStatus(item.status),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      price: `${item.currentPrice || 0} €`,
      timeLeft,
      isTimeUrgent: timeIsUrgent,
    };
  });

  return transformedAuctions;
}

export function useAuctionsQuery(
  filter: AuctionFilter,
  page = 1,
  limit = 500,
  options: UseAuctionsQueryOptions = {},
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    refetchInterval = QUERY_CONSTANTS.REFRESH_INTERVALS.SLOW,
  } = options;

  return useQuery({
    queryKey: ['auctions', filter, page, limit],
    queryFn: async () => {
      const response = await auctionsAPI.getAuctions(filter, page, limit);

      const transformedData = {
        auctions: transformAuctionData(response),
        pagination: response.pagination || {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0,
        },
      };

      return transformedData;
    },
    enabled,
    staleTime,
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (
          axiosError.response?.status === 404 ||
          axiosError.response?.status === 401
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
