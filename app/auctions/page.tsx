"use client";

import { AppLayout } from "@/components/features/layout/app-layout";
import { AuctionTabContent, AuctionData } from "@/components/features/auctions/auction-tab-content";
import { EditAuctionDialog } from "@/components/features/auctions/edit-auction-dialog";
import { useAuctionsQuery } from "../../hooks/useAuctionsQuery";
import { useAuctionMutations } from "../../hooks/useAuctionMutations";
import { useState, useMemo } from "react";

interface AuctionsResponse {
  auctions: AuctionData[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AuctionsPage() {
  const { deleteAuction } = useAuctionMutations();
  const [editingAuction, setEditingAuction] = useState<AuctionData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: allAuctionsData,
    isLoading: isLoadingAllAuctions,
    error: allAuctionsError,
  } = useAuctionsQuery("ALL", 1, 500);

  const allAuctions = (allAuctionsData as AuctionsResponse)?.auctions || [];

  const handleEditAuction = (auctionId: string) => {
    const auction = allAuctions?.find(a => a.id === auctionId);
    if (auction) {
      setEditingAuction(auction);
      setIsEditDialogOpen(true);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (formData.success) {
      setEditingAuction(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    await deleteAuction(auctionId);
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingAuction(null);
    }
  };

  const convertToEditAuctionData = useMemo(() => (auction: AuctionData) => ({
    id: auction.id,
    title: auction.title,
    description: auction.description || '',
    startingPrice: auction.startingPrice || 0,
    currentPrice: auction.currentPrice || 0,
    endTime: auction.endTime || new Date().toISOString(),
    imageUrl: auction.imageUrl,
    sellerId: auction.sellerId || '',
    status: auction.status || 'in-progress',
    createdAt: auction.createdAt || new Date().toISOString(),
    updatedAt: auction.updatedAt || new Date().toISOString(),
  }), []);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <h1 className="px-8 py-4 text-[32px] font-bold shrink-0">Auctions</h1>

        <div className="flex-1 overflow-hidden">
          <AuctionTabContent
            filter="ALL"
            auctions={allAuctions}
            isLoading={isLoadingAllAuctions}
            error={allAuctionsError?.message}
            onEdit={handleEditAuction}
            onDelete={handleDeleteAuction}
          />
        </div>
      </div>

      <EditAuctionDialog
        auction={editingAuction ? convertToEditAuctionData(editingAuction) : null}
        onSubmit={handleEditSubmit}
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogChange}
      />
    </AppLayout>
  );
}