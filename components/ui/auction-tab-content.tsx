"use client";

import { AuctionCard } from "./auction-card";

export type AuctionFilter = "OWN" | "BID" | "WON";

export interface AuctionData {
  id: string;
  title: string;
  price: string;
  status: "in-progress" | "outbid" | "winning" | "done";
  timeLeft: string;
  imageUrl?: string;
}

interface AuctionTabContentProps {
  filter: AuctionFilter;
  auctions?: AuctionData[];
  isLoading?: boolean;
  error?: string | null;
  onEdit?: (auctionId: string) => void;
  onDelete?: (auctionId: string) => void;
}

export function AuctionTabContent({
  filter,
  auctions,
  isLoading,
  error,
  onEdit,
  onDelete,
}: AuctionTabContentProps) {
  const isEditable = filter === "OWN";

  if (isLoading) {
    return (
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 xs:grid-cols:2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="bg-gray-100 animate-pulse h-[250px] w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 pb-8">
        <div className="text-red-800">
          Failed to load auctions: {error}. Please try again later.
        </div>
      </div>
    );
  }

  if (!auctions || auctions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-3 text-center ">
          <div className="text-text-primary text-[26px] font-bold w-full">
            {filter === "OWN" && "Oh no, no auctions added!"}
            {filter === "BID" && "No bidding in progress!"}
            {filter === "WON" && "Nothing here yet?"}
          </div>
          <div className="text-gray-40 text-base font-light w-full">
            {filter === "OWN" && <span>To add new auction click \"+\" button in <br/> navigation bar and new auctions wil be <br/> added here!</span>}
            {filter === "BID" && <span>Start bidding by finding new items you <br/> like on \"Auction\" page!</span>}
            {filter === "WON" && <span>When you win auction items <br/> will be displayed here! Go on <br/> and bid on your favorite <br/> items!</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pb-8">
      <div className="grid grid-cols-1 xs:grid-cols:2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {auctions.map((auction) => (
          <AuctionCard
            key={auction.id}
            variant={isEditable ? "editable" : "default"}
            title={auction.title}
            price={auction.price}
            status={auction.status}
            timeLeft={auction.timeLeft}
            imageUrl={auction.imageUrl}
            onDelete={isEditable ? () => onDelete?.(auction.id) : undefined}
            onEdit={isEditable ? () => onEdit?.(auction.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}