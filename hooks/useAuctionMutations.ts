"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { auctionsAPI } from "../services/api";
import { AuctionFilter } from "../components/ui/auction-tab-content";

// Hook for managing auction mutations (delete, edit, etc.)
export function useAuctionMutations() {
  const queryClient = useQueryClient();

  // Delete auction mutation
  const deleteAuctionMutation = useMutation({
    mutationFn: async (auctionId: string) => {
      // TODO: Implement delete API call when available
      // await auctionsAPI.deleteAuction(auctionId);
      console.log("Deleting auction:", auctionId);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return auctionId;
    },
    onSuccess: () => {
      // Invalidate OWN auctions query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ["auctions", "OWN"],
        refetchType: "active"
      });
    },
    onError: (error) => {
      console.error("Failed to delete auction:", error);
    }
  });

  // Edit auction mutation
  const editAuctionMutation = useMutation({
    mutationFn: async ({ auctionId, data }: { auctionId: string; data: any }) => {
      // TODO: Implement edit API call when available
      // await auctionsAPI.updateAuction(auctionId, data);
      console.log("Editing auction:", auctionId, data);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { auctionId, data };
    },
    onSuccess: () => {
      // Invalidate OWN auctions query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ["auctions", "OWN"],
        refetchType: "active"
      });
    },
    onError: (error) => {
      console.error("Failed to edit auction:", error);
    }
  });

  return {
    deleteAuction: deleteAuctionMutation.mutateAsync,
    editAuction: editAuctionMutation.mutateAsync,
    isDeleting: deleteAuctionMutation.isPending,
    isEditing: editAuctionMutation.isPending,
    deleteError: deleteAuctionMutation.error,
    editError: editAuctionMutation.error,
  };
}

// Hook for prefetching auction data
export function useAuctionPrefetcher() {
  const queryClient = useQueryClient();

  const prefetchAuctions = (filter: AuctionFilter, page = 1, limit = 20) => {
    queryClient.prefetchQuery({
      queryKey: ["auctions", filter, page, limit],
      queryFn: async () => {
        const response = await auctionsAPI.getAuctions(filter, page, limit);
        return {
          auctions: response.auctions || [],
          pagination: response.pagination
        };
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Prefetch all tabs data (useful for background loading)
  const prefetchAllTabs = () => {
    prefetchAuctions("OWN");
    prefetchAuctions("BID");
    prefetchAuctions("WON");
  };

  return {
    prefetchAuctions,
    prefetchAllTabs,
  };
}

// Hook for invalidating auction queries (useful after mutations)
export function useAuctionInvalidator() {
  const queryClient = useQueryClient();

  const invalidateAuctions = (filter?: AuctionFilter) => {
    if (filter) {
      queryClient.invalidateQueries({
        queryKey: ["auctions", filter],
        refetchType: "active"
      });
    } else {
      // Invalidate all auction queries
      queryClient.invalidateQueries({
        queryKey: ["auctions"],
        refetchType: "active"
      });
    }
  };

  return {
    invalidateAuctions,
  };
}