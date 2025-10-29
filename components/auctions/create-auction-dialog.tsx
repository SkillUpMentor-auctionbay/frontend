"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddAuctionCard } from "./add-auction-card";
import { type AuctionFormData } from "@/types/auction";

interface CreateAuctionDialogProps {
  children: React.ReactNode;
  onSubmit?: (data: AuctionFormData) => void;
}

export function CreateAuctionDialog({ children, onSubmit }: CreateAuctionDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = async (data: AuctionFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      // Only close dialog if auction creation succeeds
      setOpen(false);
    } catch (error) {
      // Keep dialog open if there's an error (validation or API error)
      console.log("Auction creation failed, keeping dialog open:", error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none">
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 w-full max-w-[533px]">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-bold text-[23px] leading-[1.2] text-gray-90">
              Add auction
            </DialogTitle>
          </div>
          
          <AddAuctionCard
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            className="border-none bg-transparent p-0 shadow-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}