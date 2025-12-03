'use client';

import { ScrollArea } from '@/components/ui/layout/scroll-area';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/primitives/avatar';
import { DetailedAuctionResponse } from '@/types/auction';
import { formatBidDate } from '@/utils/dateUtils';
import { getProfilePictureUrl } from '@/utils/imageUtils';

interface BiddingHistoryProps {
  readonly bids: DetailedAuctionResponse['bids'];
  readonly className?: string;
}

interface BidHistoryItemProps {
  readonly bid: DetailedAuctionResponse['bids'][0];
}

function BidHistoryItem({ bid }: BidHistoryItemProps) {
  const bidderInitials =
    `${bid.bidder.name?.[0] || ''}${bid.bidder.surname?.[0] || ''}`.toUpperCase();
  const profilePictureUrl = getProfilePictureUrl(bid.bidder.profilePictureUrl);

  return (
    <div className="border-b border-gray-10 flex gap-8 items-center py-2 px-0 w-full">
      <div className="flex gap-4 items-center flex-[1_0_0]">
        <Avatar className="size-8 rounded-full">
          {profilePictureUrl ? (
            <AvatarImage
              src={profilePictureUrl}
              alt={`${bid.bidder.name} ${bid.bidder.surname}`}
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
      <div
        className={`${className} bg-background-2 p-4 flex flex-col gap-4 items-start rounded-2xl h-full`}
      >
        <h4 className="font-bold text-[23px] leading-[1.2] text-black">
          Bidding history(0)
        </h4>
        <div className=" p-8 text-center w-full flex flex-col h-full justify-center gap-2">
          <h5 className=" text-[18px] font-semibold text-text-primary">
            No bids yet!
          </h5>
          <p className="text-gray-40 text-[16px] font-light">
            Place your bid to have a chance to get this item.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} bg-background-2 p-4 text-black flex flex-col gap-4 items-start rounded-2xl h-full`}
    >
      <div className="flex flex-col gap-4 items-start w-full">
        <h4 className="font-bold text-[23px] leading-[1.2] text-black">
          Bidding history({bids.length || 0})
        </h4>
      </div>
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-start w-full font-semibold text-[16px]">
          {bids.map((bid) => (
            <BidHistoryItem key={bid.id} bid={bid} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
