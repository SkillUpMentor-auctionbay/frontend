"use client";

import { useRouter } from "next/navigation";
import { AuctionCard } from "./auction-card";
import { useAuth } from "@/contexts/auth-context";
import { AuctionData as CoreAuctionData } from "@/types/auction";
import { ScrollArea } from "@/components/ui/layout/scroll-area";

export type AuctionFilter = "ALL" | "OWN" | "BID" | "WON";

export interface AuctionData extends Omit<CoreAuctionData, 'status'> {
  price: string;
  timeLeft: string;
  isTimeUrgent: boolean;
  status: "in-progress" | "outbid" | "winning" | "done";
  endTime: string;
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
  const router = useRouter();

  const checkIfEditable = (auction: AuctionData) => {
    if (auction.status === "done" || new Date(auction.endTime) <= new Date()) {
      return false;
    }

    if (filter === "ALL") {
      return auction.sellerId === user?.id;
    }
    return filter === "OWN";
  };

  const handleAuctionClick = (auctionId: string) => {
    router.push(`/auctions/${auctionId}`);
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <ScrollArea className="h-full">
          <div className="px-8 pb-8 flex items-center justify-center h-full">
            <div className="text-text-primary">Loading auctions...</div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full">
        <ScrollArea className="h-full">
          <div className="px-8 pb-8 flex items-center justify-center h-full">
            <div className="text-red-800 text-center">
              Failed to load auctions: {error}. Please try again later.
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (!auctions || auctions.length === 0) {
    return (
      <div className="h-full">
          <div className="px-8 pb-8 flex items-center justify-center h-full ">
            <div className="flex flex-col items-center justify-center gap-3 text-center ">
              <div className="text-text-primary text-[26px] font-bold w-full ">
                {filter === "ALL" && "No auctions available!"}
                {filter === "OWN" && "Oh no, no auctions added!"}
                {filter === "BID" && "No bidding in progress!"}
                {filter === "WON" && "Nothing here yet?"}
              </div>
              <div className="text-gray-40 text-base font-light w-full ">
                {filter === "ALL" && <span>There are no auctions at the moment. <br/> Check back later for new items!</span>}
                {filter === "OWN" && <span>To add new auction click "+" button in <br/> navigation bar and new auctions wil be <br/> added here!</span>}
                {filter === "BID" && <span>Start bidding by finding new items you <br/> like on "Auction" page!</span>}
                {filter === "WON" && <span>When you win auction items <br/> will be displayed here! Go on <br/> and bid on your favorite <br/> items!</span>}
              </div>
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 xs:grid-cols:2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch">
            {auctions?.map((auction) => {
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
                  endTime={auction.endTime}
                  imageUrl={auction.imageUrl}
                  onClick={() => handleAuctionClick(auction.id)}
                  onDelete={isEditable ? () => onDelete?.(auction.id) : undefined}
                  onEdit={isEditable ? () => onEdit?.(auction.id) : undefined}
                />
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
