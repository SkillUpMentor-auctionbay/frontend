"use client";

import { DetailedAuctionResponse } from "../../types/auction";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { InputField } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { BiddingHistory } from "./bidding-history";
import { useAuth } from "../../hooks/useAuth";

interface AuctionDetailsProps {
  auction: DetailedAuctionResponse;
  className?: string;
}

function formatTimeLeft(endTime: string): string {
  const endTimeDate = new Date(endTime).getTime();
  const now = new Date().getTime();
  const diff = endTimeDate - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days}d`;
  } else {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h`;
  }
}

export function AuctionDetails({ auction, className }: AuctionDetailsProps) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const isOwnAuction = auction.seller.id === currentUserId;

  return (
    <div className={`${className} p-4 flex flex-col gap-4 h-full`}>
      {/* Badges */}
      <div className="flex justify-between gap-2">
        <Badge
          variant={auction.status === 'IN_PROGRESS' ? 'in-progress' :
                    auction.status === 'OUTBID' ? 'outbid' :
                    auction.status === 'WINNING' ? 'winning' : 'done'}
          size="default"
        >
          {auction.status === 'IN_PROGRESS' ? 'In progress' :
           auction.status === 'OUTBID' ? 'Outbid' :
           auction.status === 'WINNING' ? 'Winning' : 'Done'}
        </Badge>
        <Badge
          variant={new Date(auction.endTime) > new Date() ? 'time' : 'time-urgent'}
          size="default"
          showTimeIcon={true}
        >
          {formatTimeLeft(auction.endTime)}
        </Badge>
      </div>

      {/* Title and Description */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-black text-[32px]">{auction.title}</h1>
        <div className="text-black font-light text-[16px]">
          {auction.description}
        </div>
      </div>

      {/* Tabs - Only show if user is not the auction owner */}
      {!isOwnAuction && (
        <Tabs defaultValue="bid" className="flex-1 flex flex-col">
          <div className="flex justify-start">
            <TabsList className="mb-4">
              <TabsTrigger value="bid" className="w-[97px]">Bid</TabsTrigger>
              <TabsTrigger value="auto-bid" className="w-[97px]">Auto bid</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bid" className="">
            <div className="flex justify-end items-center gap-4">
              <span className=" text-[16px] font-light">Bid:</span>
              <input
                type="number"
                step="0.01"
                min={auction.currentPrice + 0.01}
                placeholder={`${auction.currentPrice + 0.01}`}
                className="bg-white border w-[100px] border-gray-20 font-normal text-base rounded-2xl h-10 px-4 py-2 transition-all hover:border-gray-30 focus:border-primary-50 focus:text-gray-90 outline-none [-webkit-appearance:none] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button variant="primary">
                Place bid
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="auto-bid" className="">
            <div className="flex justify-end items-center gap-4">
              <span className="text-[16px] font-light">Bid increment:</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.50"
                className="bg-white border w-[83px] border-gray-20 text-gray-40 font-light text-base rounded-2xl h-10 px-4 py-2 transition-all hover:border-gray-30 focus:border-primary-50 focus:text-gray-90 outline-none [-webkit-appearance:none] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[16px] font-light">Max price:</span>
              <input
                type="number"
                step="0.01"
                min={auction.currentPrice + 0.01}
                placeholder="Max"
                className="bg-white border w-[83px] border-gray-20 text-gray-40 font-light text-base rounded-2xl h-10 px-4 py-2 transition-all hover:border-gray-30 focus:border-primary-50 focus:text-gray-90 outline-none [-webkit-appearance:none] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button variant="primary">
                Auto bid
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
