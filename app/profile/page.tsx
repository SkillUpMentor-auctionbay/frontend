"use client";

import { useAuth } from "@/contexts/auth-context";
import { AppLayout } from "@/components/features/layout/app-layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/navigation/tabs";
import { Card, CardContent } from "@/components/ui/primitives/card";
import { AuctionTabContent, AuctionData } from "@/components/features/auctions/auction-tab-content";
import { EditAuctionDialog } from "@/components/features/auctions/edit-auction-dialog";
import { useAuctionsQuery } from "@/hooks/useAuctionsQuery";
import { useUserStatistics } from "@/hooks/useUserStatistics";
import { useAuctionMutations, useAuctionPrefetcher } from "@/hooks/useAuctionMutations";
import { useState, useEffect, useMemo } from "react";

interface AuctionsResponse {
  auctions: AuctionData[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProfilePage() {
  const { user, isLoggingOut } = useAuth();
  const { deleteAuction } = useAuctionMutations();
  const { prefetchAuctions } = useAuctionPrefetcher();

  const [activeTab, setActiveTab] = useState<string>("my-auctions");
  const [editingAuction, setEditingAuction] = useState<AuctionData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: statistics,
    isLoading: isStatisticsLoading,
  } = useUserStatistics({}, !!user, isLoggingOut);

  const {
    data: myAuctionsData,
    isLoading: isLoadingMyAuctions,
    error: myAuctionsError,
  } = useAuctionsQuery("OWN", 1, 500, {
    enabled: activeTab === "my-auctions",
    refetchInterval: 30 * 1000
  });

  const {
    data: biddingAuctionsData,
    isLoading: isLoadingBidding,
    error: biddingError,
  } = useAuctionsQuery("BID", 1, 500, {
    enabled: activeTab === "bidding",
    refetchInterval: 30 * 1000
  });

  const {
    data: wonAuctionsData,
    isLoading: isLoadingWon,
    error: wonError,
  } = useAuctionsQuery("WON", 1, 500, {
    enabled: activeTab === "won",
    refetchInterval: 30 * 1000
  });

  const myAuctions = (myAuctionsData as AuctionsResponse)?.auctions || [];
  const biddingAuctions = (biddingAuctionsData as AuctionsResponse)?.auctions || [];
  const wonAuctions = (wonAuctionsData as AuctionsResponse)?.auctions || [];

  const totalEarnings = statistics?.totalEarnings || 0;
  const postedAuctionsCount = statistics?.totalPostedAuctions || 0;
  const biddingCount = statistics?.currentlyBidding || 0;
  const winningCount = statistics?.currentlyWinning || 0;


  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "my-auctions") {
        prefetchAuctions("BID");
        prefetchAuctions("WON");
      } else if (activeTab === "bidding") {
        prefetchAuctions("OWN");
        prefetchAuctions("WON");
      } else if (activeTab === "won") {
        prefetchAuctions("OWN");
        prefetchAuctions("BID");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [activeTab, prefetchAuctions]);

  const handleEditAuction = (auctionId: string) => {
    const auction = myAuctions?.find(a => a.id === auctionId);
    if (auction) {
      setEditingAuction(auction);
      setIsEditDialogOpen(true);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (formData.success) {
      console.log("Auction edited successfully");
      setEditingAuction(null);
      setIsEditDialogOpen(false);
    }
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
    startingPrice: auction.startingPrice || Number.parseFloat(auction.price.replace(' €', '').replace(',', '')) || 0,
    currentPrice: auction.currentPrice || Number.parseFloat(auction.price.replace(' €', '').replace(',', '')) || 0,
    endTime: auction.endTime || new Date().toISOString(),
    imageUrl: auction.imageUrl,
    sellerId: auction.sellerId || '',
    status: auction.status || 'in-progress',
    createdAt: auction.createdAt || new Date().toISOString(),
    updatedAt: auction.updatedAt || new Date().toISOString(),
  }), []);

  const handleDeleteAuction = async (auctionId: string) => {
    try {
      await deleteAuction(auctionId);
      console.log("Auction deleted successfully");
    } catch (error) {
      console.error("Failed to delete auction:", error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (isEditDialogOpen) {
      setIsEditDialogOpen(false);
      setEditingAuction(null);
    }
  };

  return (
    <AppLayout>
      <div className="w-full h-full flex flex-col gap-4 ">
        <h1 className="text-3xl font-bold mt-4 px-8">
          Hello {user?.name} {user?.surname} !
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-8">
          <Card className="bg-gray-50 h-[202px]">
            <CardContent className="flex flex-col justify-between w-full h-full text-primary">
              <div>
                <h4 className=" text-xl font-bold">Earnings</h4>
                <h4 className=" text-base font-light">All-time</h4>
              </div>
              <div className="text-[80px] font-bold leading-none">
                <h1>{isStatisticsLoading ? "..." : totalEarnings.toFixed(0)} €</h1>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[202px]">
            <CardContent className="flex flex-col justify-between w-full h-full text-text-primary">
              <div>
                <h4 className=" text-xl font-bold">Posted auctions</h4>
                <h4 className=" text-base font-light">All-time</h4>
              </div>
              <div className="text-[80px] font-bold leading-none">
                <h1>{isStatisticsLoading ? "..." : postedAuctionsCount}</h1>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[202px]">
            <CardContent className="flex flex-col justify-between w-full h-full text-text-primary">
              <div>
                <h4 className=" text-xl font-bold">Currently bidding</h4>
              </div>
              <div className="text-[80px] font-bold leading-none">
                <h1>{isStatisticsLoading ? "..." : biddingCount}</h1>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[202px]">
            <CardContent className="flex flex-col justify-between w-full h-full text-text-primary">
              <div>
                <h4 className=" text-xl font-bold">Currently winning</h4>
              </div>
              <div className={`text-[80px] font-bold leading-none ${winningCount != 0 && 'text-green-card-winning'}`}>
                <h1>{winningCount}</h1>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="my-auctions" onValueChange={handleTabChange} className="w-full h-[calc(100%-286px)]">
          <div className="flex justify-center">
            <TabsList className="mb-4">
              <TabsTrigger value="my-auctions">My auctions</TabsTrigger>
              <TabsTrigger value="bidding">Bidding</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-auctions" className="flex-1 overflow-y-auto">
            <AuctionTabContent
              filter="OWN"
              auctions={myAuctions}
              isLoading={isLoadingMyAuctions}
              error={myAuctionsError?.message}
              onEdit={handleEditAuction}
              onDelete={handleDeleteAuction}
            />
          </TabsContent>

          <TabsContent value="bidding" className="flex-1 overflow-y-auto">
            <AuctionTabContent
              filter="BID"
              auctions={biddingAuctions}
              isLoading={isLoadingBidding}
              error={biddingError?.message}
            />
          </TabsContent>

          <TabsContent value="won" className="flex-1 overflow-y-auto">
            <AuctionTabContent
              filter="WON"
              auctions={wonAuctions}
              isLoading={isLoadingWon}
              error={wonError?.message}
            />
          </TabsContent>
        </Tabs>
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