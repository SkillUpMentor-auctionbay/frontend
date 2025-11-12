"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DetailedAuctionResponse, BidFormData, FormValidationErrors } from "../../types/auction";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { InputField } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { BiddingHistory } from "./bidding-history";
import { useAuth } from "../../hooks/useAuth";
import { usePlaceBid } from "../../hooks/usePlaceBid";

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

  // Initialize bid form with minimum bid amount (current price + 1.00)
  const minimumBid = (auction.currentPrice + 1.00).toFixed(2);
  const [bidFormData, setBidFormData] = React.useState<BidFormData>({
    amount: minimumBid,
  });
  const [hiddenValidationErrors, setHiddenValidationErrors] = React.useState<Set<string>>(new Set());

  // Use the bid hook
  const { placeBid, isLoading, error, validationErrors, hasValidationErrors, reset, clearValidationErrors } = usePlaceBid(
    auction.id,
    auction.currentPrice
  );

  const handleBidAmountChange = (value: string) => {
    setBidFormData(prev => ({ ...prev, amount: value }));

    // Hide validation error for bid amount when user starts typing valid data
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

      // The auction data will be updated via React Query invalidation
      // Clear validation errors - the form will be updated by the useEffect below
      setHiddenValidationErrors(new Set());
    } catch (error) {
      // Error is handled by the hook and displayed in the UI
      console.log("Bid placement handled with validation:", error);
    }
  };

  // Update bid form when auction current price changes
  React.useEffect(() => {
    const newMinimumBid = (auction.currentPrice + 1.00).toFixed(2);
    setBidFormData(prev => {
      // Only update if the current value is less than the new minimum (invalid bid)
      const currentAmount = parseFloat(prev.amount);
      const minimumAmount = parseFloat(newMinimumBid);

      // If current value is invalid (less than minimum), update to minimum
      if (currentAmount < minimumAmount) {
        return { amount: newMinimumBid };
      }

      // If current value is valid, keep it unchanged
      return prev;
    });
  }, [auction.currentPrice]);

  // Compute visible validation errors (excluding hidden ones)
  const visibleValidationErrors = React.useMemo(() => {
    const errors: FormValidationErrors = {};
    Object.keys(validationErrors || {}).forEach(key => {
      if (!hiddenValidationErrors.has(key)) {
        errors[key as keyof FormValidationErrors] = validationErrors![key as keyof FormValidationErrors];
      }
    });
    return errors;
  }, [validationErrors, hiddenValidationErrors]);

  // Clear hidden errors when form is submitted again or when there are general API errors
  React.useEffect(() => {
    if (hasValidationErrors) {
      // Only clear field-specific errors, keep general errors visible
      setHiddenValidationErrors(new Set());
    }
  }, [hasValidationErrors]);

  // Clear errors when form data changes (but only if there are no validation errors)
  React.useEffect(() => {
    if (error && !hasValidationErrors) {
      reset();
    }
  }, [bidFormData, error, hasValidationErrors, reset]);

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
          </TabsContent>

          <TabsContent value="auto-bid" className="">
            <div className="flex justify-end items-center gap-4">
              <span className="text-[16px] font-light">Bid increment:</span>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="0.50"
                className="bg-white border w-[83px] border-gray-20 text-gray-40 font-light text-base rounded-2xl h-10 px-4 py-2 transition-all hover:border-gray-30 focus:border-primary-50 focus:text-gray-90 outline-none [-webkit-appearance:none] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[16px] font-light">Max price:</span>
              <input
                type="number"
                step="1"
                min={auction.currentPrice + 1}
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
