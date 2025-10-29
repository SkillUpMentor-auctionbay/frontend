"use client";

import { AuctionCard } from "./auction-card";
import { useAuth } from "../../contexts/AuthContext";

export type AuctionFilter = "ALL" | "OWN" | "BID" | "WON";

export interface AuctionData {
  id: string;
  title: string;
  price: string;
  status: "in-progress" | "outbid" | "winning" | "done";
  timeLeft: string;
  isTimeUrgent?: boolean;
  imageUrl?: string;
  sellerId?: string;
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
  const { user } = useAuth();

  // For "ALL" filter, individual auctions can be editable if owned by current user
  // For "OWN" filter, all auctions are editable
  // For other filters, no auctions are editable
  const checkIfEditable = (auction: AuctionData) => {
    if (filter === "ALL") {
      return auction.sellerId === user?.id;
    }
    return filter === "OWN";
  };

  if (isLoading) {
    return (
      <div className="px-8 pb-8 h-full overflow-y-auto flex items-center justify-center">
        <div className="text-text-primary">Loading auctions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 pb-8 h-full overflow-y-auto flex items-center justify-center">
        <div className="text-red-800">
          Failed to load auctions: {error}. Please try again later.
        </div>
      </div>
    );
  }

  if (!auctions || auctions.length === 0) {
    return (
      <div className="px-8 pb-8 h-full overflow-y-auto">
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3 text-center ">
            <div className="text-text-primary text-[26px] font-bold w-full">
              {filter === "ALL" && "No auctions available!"}
              {filter === "OWN" && "Oh no, no auctions added!"}
              {filter === "BID" && "No bidding in progress!"}
              {filter === "WON" && "Nothing here yet?"}
            </div>
            <div className="text-gray-40 text-base font-light w-full">
              {filter === "ALL" && <span>There are no auctions at the moment. <br/> Check back later for new items!</span>}
              {filter === "OWN" && <span>To add new auction click \"+\" button in <br/> navigation bar and new auctions wil be <br/> added here!</span>}
              {filter === "BID" && <span>Start bidding by finding new items you <br/> like on \"Auction\" page!</span>}
              {filter === "WON" && <span>When you win auction items <br/> will be displayed here! Go on <br/> and bid on your favorite <br/> items!</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pb-8 h-full overflow-y-auto">
      <div className="grid grid-cols-1 xs:grid-cols:2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch">
        {auctions.map((auction) => {
          const isEditable = checkIfEditable(auction);
          return (
            <AuctionCard
              key={auction.id}
              variant={isEditable ? "editable" : "default"}
              title={auction.title}
              price={auction.price}
              status={auction.status}
              timeLeft={auction.timeLeft}
              isTimeUrgent={auction.isTimeUrgent}
              imageUrl={auction.imageUrl}
              onDelete={isEditable ? () => onDelete?.(auction.id) : undefined}
              onEdit={isEditable ? () => onEdit?.(auction.id) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}