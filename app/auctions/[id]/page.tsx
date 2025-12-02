"use client";

import { use } from "react";
import { AppLayout } from "@/components/features/layout/app-layout";
import { useAuctionDetailQuery } from "../../../hooks/useAuctionDetailQuery";
import { AuctionImage } from "@/components/features/auctions/auction-image";
import { AuctionDetails } from "@/components/features/auctions/auction-details";
import { BiddingHistory } from "@/components/features/auctions/bidding-history";

interface AuctionPageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export default function AuctionPage({ params }: AuctionPageProps) {
  const resolvedParams = use(params);
  const { data: auction, isLoading, error } = useAuctionDetailQuery(resolvedParams.id);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          <h1 className="px-8 py-4 text-[32px] font-bold shrink-0">
            Auction Details
          </h1>
          <div className="flex-1 px-8 pb-8 flex items-center justify-center">
            <div className="text-text-primary">Loading auction details...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          <h1 className="px-8 py-4 text-[32px] font-bold shrink-0">
            Auction Details
          </h1>
          <div className="flex-1 px-8 pb-8 flex items-center justify-center">
            <div className="text-red-800 text-center">
              <h2 className="text-xl font-bold mb-2">Error Loading Auction</h2>
              <p>
                {typeof error === 'object' && 'message' in error
                  ? (error as any).message
                  : "Failed to load auction details. Please try again later."}
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!auction) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          <h1 className="px-8 py-4 text-[32px] font-bold shrink-0">
            Auction Details
          </h1>
          <div className="flex-1 px-8 pb-8 flex items-center justify-center">
            <div className="text-gray-600 text-center">
              <h2 className="text-xl font-bold mb-2">Auction Not Found</h2>
              <p>The auction you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex-1 px-8 pb-8">
          <div className="flex h-full gap-4">
            <div className="w-1/2">
              <AuctionImage
                imageUrl={auction.imageUrl}
                title={auction.title}
              />
            </div>

            <div className="w-1/2 flex flex-col gap-4">
              <div className="bg-white rounded-2xl">
                <AuctionDetails auction={auction} />
              </div>

              <div className="bg-white rounded-2xl flex-1 overflow-hidden">
                <BiddingHistory bids={auction.bids} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
