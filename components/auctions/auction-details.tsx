"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DetailedAuctionResponse, BidFormData, FormValidationErrors } from "../../types/auction";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";
import { usePlaceBid } from "../../hooks/usePlaceBid";
import { useAuctionTimer } from "../../hooks/useAuctionTimer";

interface AuctionDetailsProps {
  auction: DetailedAuctionResponse;
  className?: string;
}

export function AuctionDetails({ auction, className }: AuctionDetailsProps) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const isOwnAuction = auction.seller.id === currentUserId;

  const { timeLeft, isTimeUrgent } = useAuctionTimer(auction.endTime);

  const minimumBid = (auction.currentPrice + 1).toFixed(2);
  const [bidFormData, setBidFormData] = React.useState<BidFormData>({
    amount: minimumBid,
  });
  const [hiddenValidationErrors, setHiddenValidationErrors] = React.useState<Set<string>>(new Set());

  const { placeBid, isLoading, error, validationErrors, hasValidationErrors, reset, clearValidationErrors } = usePlaceBid(
    auction.id,
    auction.currentPrice,
    auction
  );

  const handleBidAmountChange = (value: string) => {
    setBidFormData(prev => ({ ...prev, amount: value }));

    if (hasValidationErrors && validationErrors?.amount) {
      const amountStr = value.trim();
      const amount = parseFloat(amountStr);
      const isValidAmount = amountStr.length > 0 &&
                            /^-?\d*\.?\d*$/.test(amountStr) &&
                            !isNaN(amount) &&
                            amount > auction.currentPrice &&
                            amount >= auction.currentPrice + 1.00 &&
                            amount <= 999999.99;

      if (isValidAmount) {
        setHiddenValidationErrors(prev => new Set([...prev, 'amount']));
      }
    }
  };

  const handlePlaceBid = async () => {
    try {
      await placeBid(bidFormData);

      setHiddenValidationErrors(new Set());
    } catch (error) {
      console.log("Bid placement handled with validation:", error);
    }
  };

  React.useEffect(() => {
    const newMinimumBid = (auction.currentPrice + 1).toFixed(2);
    setBidFormData(prev => {
      const currentAmount = Number.parseFloat(prev.amount);
      const minimumAmount = Number.parseFloat(newMinimumBid);

      if (currentAmount < minimumAmount) {
        return { amount: newMinimumBid };
      }

      return prev;
    });
  }, [auction.currentPrice]);

  const visibleValidationErrors = React.useMemo(() => {
    const errors: FormValidationErrors = {};
    Object.keys(validationErrors || {}).forEach(key => {
      if (!hiddenValidationErrors.has(key)) {
        errors[key as keyof FormValidationErrors] = validationErrors![key as keyof FormValidationErrors];
      }
    });
    return errors;
  }, [validationErrors, hiddenValidationErrors]);

  React.useEffect(() => {
    if (hasValidationErrors) {
      setHiddenValidationErrors(new Set());
    }
  }, [hasValidationErrors]);

  React.useEffect(() => {
    if (error && !hasValidationErrors) {
      reset();
    }
  }, [bidFormData, error, hasValidationErrors, reset]);

  return (
    <div className={`${className} p-4 flex flex-col gap-4 h-full`}>
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
          variant={auction.status === 'DONE' ? 'time-outbid' : isTimeUrgent ? 'time-urgent' : 'time'}
          size="default"
          showTimeIcon={true}
        >
          {auction.status === 'DONE' ? 'Ended' : timeLeft}
        </Badge>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-black text-[32px]">{auction.title}</h1>
        <div className="text-black font-light text-[16px]">
          {auction.description}
        </div>
      </div>

      {!isOwnAuction && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end items-center gap-4">
            <span className="text-[16px] font-light">Bid:</span>
            <div>
              <input
                type="number"
                step="1"
                min={minimumBid}
                value={bidFormData.amount}
                onChange={(e) => handleBidAmountChange(e.target.value)}
                className={cn(
                  visibleValidationErrors?.amount && "border-red-500 focus:border-red-500",
                  "bg-white border w-[100] border-gray-20 text-gray-40 font-light text-base rounded-2xl h-10 px-4 py-2 transition-all hover:border-gray-30 focus:border-primary-50 focus:text-gray-90 outline-none [-webkit-appearance:none] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
              />
              {visibleValidationErrors?.amount && (
                <p className="text-red-500 text-sm mt-1">{visibleValidationErrors.amount}</p>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handlePlaceBid}
              disabled={isLoading}
            >
              {isLoading ? "Placing..." : "Place bid"}
            </Button>
          </div>

          {/* General Error Display */}
          {visibleValidationErrors?.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{visibleValidationErrors.general}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
