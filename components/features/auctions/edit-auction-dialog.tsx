'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/overlays/dialog';
import {
  AuctionData,
  AuctionError,
  EditAuctionFormData,
} from '@/types/auction';
import * as React from 'react';
import { EditAuctionCard } from './edit-auction-card';

interface EditAuctionDialogProps {
  readonly children?: React.ReactNode;
  readonly auction: AuctionData | null;
  readonly onSubmit?: (data: EditAuctionFormData) => void;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

export function EditAuctionDialog({
  children,
  auction,
  onSubmit,
  open: controlledOpen,
  onOpenChange,
}: EditAuctionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleSubmit = async (data: EditAuctionFormData) => {
    try {
      if (onSubmit) {
        onSubmit(data);
      }

      if (data.success) {
        setOpen(false);
      }
    } catch (error) {
      if ((error as AuctionError)?.code === 'VALIDATION_ERROR') {
        return;
      }
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-[600px] p-0 border-none bg-transparent shadow-none">
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 w-full max-w-[533px]">
          <DialogTitle className="font-bold text-[23px]">
            Edit auction
          </DialogTitle>

          {auction ? (
            <EditAuctionCard
              auction={auction}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={true}
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
