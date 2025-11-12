"use client";

import { DetailedAuctionResponse } from "../../types/auction";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getProfilePictureUrl } from "@/lib/image-url";

interface BiddingHistoryProps {
  bids: DetailedAuctionResponse['bids'];
  className?: string;
}

interface BidHistoryItemProps {
  bid: DetailedAuctionResponse['bids'][0];
}

function BidHistoryItem({ bid }: BidHistoryItemProps) {
  const formatBidDate = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\//g, '.');
    return `${time} ${dateStr}`;
  };

  const bidderInitials = `${bid.bidder.name?.[0] || ''}${bid.bidder.surname?.[0] || ''}`.toUpperCase();
  const profilePictureUrl = getProfilePictureUrl(bid.bidder.profilePictureUrl);

  return (
    <div className="border-b border-gray-10 flex gap-8 items-center py-2 px-0 w-full">
      <div className="flex gap-4 items-center flex-[1_0_0]">
        <Avatar className="size-8 rounded-full">
          {profilePictureUrl ? (
            <AvatarImage
              src={profilePictureUrl}
              alt={`${bid.bidder.name} ${bid.bidder.surname}`}
              onError={(e) => {
                console.error('Avatar image failed to load:', e);
              }}
            />
          ) : (
            <AvatarFallback className="bg-gray-20 text-gray-70 font-light text-sm">
              {bidderInitials}
            </AvatarFallback>
          )}
        </Avatar>
        <p className="flex-[1_0_0] font-light text-[16px] leading-6 text-black whitespace-pre-wrap">
          {bid.bidder.name} {bid.bidder.surname}
        </p>
      </div>
      <p className="font-light text-[16px] leading-6 text-black shrink-0">
        {formatBidDate(bid.createdAt)}
      </p>
      <div className="bg-primary-50 flex gap-1 items-center justify-center px-4 py-1.5 rounded-2xl shrink-0">
        <p className="font-semibold text-[16px] leading-[1.2] text-gray-50">
          {bid.amount}
        </p>
        <span className="text-[16px] leading-[1.2] text-gray-50 font-medium">
          €
        </span>
      </div>
    </div>
  );
}

export function BiddingHistory({ bids, className }: BiddingHistoryProps) {
  if (!bids || bids.length === 0) {
    return (
      <div className={`${className} bg-background-2 p-4 flex flex-col gap-4 items-start rounded-2xl h-full`}>
        <h4 className="font-bold text-[23px] leading-[1.2] text-black">
          Bidding history(0)
        </h4>
        <div className=" p-8 text-center w-full flex flex-col h-full justify-center gap-2">
          <h5 className=" text-[18px] font-semibold text-text-primary">No bids yet!</h5>
          <p className="text-gray-40 text-[16px] font-light">Place your bid to have a chance to get this item.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-background-2 p-4 text-black flex flex-col gap-4 items-start rounded-2xl h-full`}>
      <div className="flex flex-col gap-4 items-start w-full">
        <h4 className="font-bold text-[23px] leading-[1.2] text-black">
          Bidding history({bids.length || 0})
        </h4>
      </div>
      <div className="flex flex-col items-start w-full font-semibold text-[16px] h-8">
        {bids.map((bid) => (
          <BidHistoryItem key={bid.id} bid={bid} />
        ))}
      </div>
    </div>
  );
}
