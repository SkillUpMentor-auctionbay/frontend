"use client";

import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { AppLayout } from "../../components/layout/app-layout";
import { AuctionTabContent } from "../../components/ui/auction-tab-content";
import { useAuctionsQuery } from "../../hooks/useAuctionsQuery";
import { useAuctionMutations } from "../../hooks/useAuctionMutations";

export default function AuctionsPage() {
  const { user, logout, isLoggingOut } = useAuth();
  const { deleteAuction, editAuction, isDeleting, isEditing } = useAuctionMutations();

  const {
    data: allAuctionsData,
    isLoading: isLoadingAllAuctions,
    error: allAuctionsError,
  } = useAuctionsQuery("ALL", 1, 50);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleEditAuction = async (auctionId: string) => {
    try {
      await editAuction({ auctionId, data: {} });
      console.log("Auction edited successfully");
    } catch (error) {
      console.error("Failed to edit auction:", error);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    try {
      await deleteAuction(auctionId);
      console.log("Auction deleted successfully");
    } catch (error) {
      console.error("Failed to delete auction:", error);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <h1 className="px-8 py-4 text-[32px] font-bold shrink-0">Auctions</h1>

        <div className="flex-1 overflow-hidden">
          <AuctionTabContent
            filter="ALL"
            auctions={allAuctionsData?.auctions}
            isLoading={isLoadingAllAuctions}
            error={allAuctionsError?.message}
            onEdit={handleEditAuction}
            onDelete={handleDeleteAuction}
          />
        </div>
      </div>
    </AppLayout>
  );
}