"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditAuctionCard } from "./edit-auction-card";
import { EditAuctionFormData } from "@/types/auction";
import { AuctionData } from "@/types/auction";

interface EditAuctionDialogProps {
  children?: React.ReactNode;
  auction: AuctionData | null;
  onSubmit?: (data: EditAuctionFormData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditAuctionDialog({
  children,
  auction,
  onSubmit,
  open: controlledOpen,
  onOpenChange
}: EditAuctionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (data: EditAuctionFormData) => {
    try {
      setError(null);
      if (onSubmit) {
        await onSubmit(data);
      }

      if (data.success) {
        setOpen(false);
      }
    } catch (error) {
      if ((error as any)?.code === 'VALIDATION_ERROR') {
        return;
      }

      let errorMessage = "Failed to save changes. Please try again.";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setError(errorMessage);
    }
  };

  React.useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none">
        
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 w-full max-w-[533px]">
          <DialogTitle className="font-bold text-[23px]">Edit auction</DialogTitle>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {auction ? (
            <EditAuctionCard
              auction={auction}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              className="border-none bg-transparent p-0 shadow-none"
            />
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">No auction data available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}