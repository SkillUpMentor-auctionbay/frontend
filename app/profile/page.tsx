"use client";

import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { AppLayout } from "../../components/layout/app-layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuctionTabContent, AuctionData } from "@/components/ui/auction-tab-content";
import { useAuctionsQuery } from "@/hooks/useAuctionsQuery";
import { useUserStatistics } from "@/hooks/useUserStatistics";
import { useAuctionMutations, useAuctionPrefetcher } from "@/hooks/useAuctionMutations";
import { auctionsAPI } from "@/services/api";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user, logout, isLoggingOut } = useAuth();
  const { deleteAuction, editAuction, isDeleting, isEditing } = useAuctionMutations();
  const { prefetchAuctions } = useAuctionPrefetcher();

  const [activeTab, setActiveTab] = useState<string>("my-auctions");

  // Get user statistics from API
  const {
    data: statistics,
    isLoading: isStatisticsLoading,
    error: statisticsError
  } = useUserStatistics();

  console.log(`👤 [ProfilePage] Component rendering - Active tab: ${activeTab}, User: ${user?.email}`);
  console.log(`📊 [ProfilePage] Statistics data:`, statistics);

  const {
    data: myAuctionsData,
    isLoading: isLoadingMyAuctions,
    error: myAuctionsError,
  } = useAuctionsQuery("OWN", 1, 50, {
    enabled: activeTab === "my-auctions"
  });

  const {
    data: biddingAuctionsData,
    isLoading: isLoadingBidding,
    error: biddingError,
  } = useAuctionsQuery("BID", 1, 50, {
    enabled: activeTab === "bidding"
  });

  const {
    data: wonAuctionsData,
    isLoading: isLoadingWon,
    error: wonError,
  } = useAuctionsQuery("WON", 1, 50, {
    enabled: activeTab === "won"
  });

  const myAuctions = (myAuctionsData as any)?.auctions as AuctionData[] || [];
  const biddingAuctions = (biddingAuctionsData as any)?.auctions as AuctionData[] || [];
  const wonAuctions = (wonAuctionsData as any)?.auctions as AuctionData[] || [];

  // Use statistics from API instead of client-side calculations
  const totalEarnings = statistics?.totalEarnings || 0;
  const postedAuctionsCount = statistics?.totalPostedAuctions || 0;
  const biddingCount = statistics?.currentlyBidding || 0;
  const winningCount = statistics?.currentlyWinning || 0;

  console.log(`📊 [ProfilePage] Using API statistics:`, {
    activeTab,
    totalEarnings,
    postedAuctionsCount,
    biddingCount,
    winningCount,
    isLoadingStatistics: isStatisticsLoading,
    statisticsError
  });

  useEffect(() => {
    console.log(`⏰ [ProfilePage] Setting up prefetch timer for active tab: ${activeTab}`);

    const timer = setTimeout(() => {
      console.log(`🚀 [ProfilePage] Prefetching other tabs (active: ${activeTab})`);

      if (activeTab === "my-auctions") {
        console.log(`📦 [ProfilePage] Prefetching BID and WON tabs`);
        prefetchAuctions("BID");
        prefetchAuctions("WON");
      } else if (activeTab === "bidding") {
        console.log(`📦 [ProfilePage] Prefetching OWN and WON tabs`);
        prefetchAuctions("OWN");
        prefetchAuctions("WON");
      } else if (activeTab === "won") {
        console.log(`📦 [ProfilePage] Prefetching OWN and BID tabs`);
        prefetchAuctions("OWN");
        prefetchAuctions("BID");
      }
    }, 2000);

    return () => {
      console.log(`🧹 [ProfilePage] Cleaning up prefetch timer for tab: ${activeTab}`);
      clearTimeout(timer);
    };
  }, [activeTab, prefetchAuctions]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleEditAuction = async (auctionId: string) => {
    try {
      await editAuction({
        auctionId,
        data: { /* TODO: Add edit form data */ }
      });
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

  const handleTabChange = (value: string) => {
    console.log(`🔄 [ProfilePage] Tab change: ${activeTab} → ${value}`);
    setActiveTab(value);
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

          <TabsContent value="my-auctions" className="   overflow-y-auto">
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
    </AppLayout>
  );
}