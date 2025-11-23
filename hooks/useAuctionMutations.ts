"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsAPI } from "../services/api";
import { AuctionFilter } from "../components/ui/auction-tab-content";
import { UpdateAuctionRequest } from "../types/auction";

export function useAuctionMutations() {
  const queryClient = useQueryClient();

  const deleteAuctionMutation = useMutation({
    mutationFn: async (auctionId: string) => {
      await auctionsAPI.deleteAuction(auctionId);
      return auctionId;
    },
    onMutate: async (auctionId: string) => {
      await queryClient.cancelQueries({ queryKey: ["auctions", "OWN"] });
      await queryClient.cancelQueries({ queryKey: ["auctions", "ALL"] });

      const previousOwnData = queryClient.getQueryData(["auctions", "OWN", 1, 20]);
      const previousAllData = queryClient.getQueryData(["auctions", "ALL", 1, 20]);

      queryClient.setQueriesData(
        { queryKey: ["auctions", "OWN"] },
        (old: any) => {
          if (!old?.auctions) return old;

          return {
            ...old,
            auctions: old.auctions.filter((auction: any) => auction.id !== auctionId),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1
            }
          };
        }
      );

      queryClient.setQueriesData(
        { queryKey: ["auctions", "ALL"] },
        (old: any) => {
          if (!old?.auctions) return old;

          return {
            ...old,
            auctions: old.auctions.filter((auction: any) => auction.id !== auctionId),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1
            }
          };
        }
      );

      return { previousOwnData, previousAllData };
    },
     onError: (error, auctionId, context) => {
       if (context?.previousOwnData) {
         queryClient.setQueryData(["auctions", "OWN", 1, 20], context.previousOwnData);
       }
       if (context?.previousAllData) {
         queryClient.setQueryData(["auctions", "ALL", 1, 20], context.previousAllData);
       }
     },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["auctions", "OWN"],
        refetchType: "active"
      });
      queryClient.invalidateQueries({
        queryKey: ["auctions", "ALL"],
        refetchType: "active"
      });
    },
  });

  const editAuctionMutation = useMutation({
    mutationFn: async ({ auctionId, data }: { auctionId: string; data: UpdateAuctionRequest }) => {
      const response = await auctionsAPI.updateAuction(auctionId, data);
      return response;
    },
     onSuccess: (response) => {
       queryClient.invalidateQueries({
         queryKey: ["auctions", "OWN"],
         refetchType: "active"
       });

       queryClient.invalidateQueries({
         queryKey: ["auctions", "ALL"],
         refetchType: "active"
       });
     },
     onError: (error) => {
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
      staleTime: 5 * 60 * 1000
    });
  };

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

export function useAuctionInvalidator() {
  const queryClient = useQueryClient();

  const invalidateAuctions = (filter?: AuctionFilter) => {
    if (filter) {
      queryClient.invalidateQueries({
        queryKey: ["auctions", filter],
        refetchType: "active"
      });
    } else {
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