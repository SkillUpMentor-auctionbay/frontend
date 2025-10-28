"use client";

import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { AppLayout } from "../../components/layout/app-layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuctionCard } from "@/components/ui/auction-card";

export default function ProfilePage() {
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AppLayout>
      <div className="w-full h-full flex flex-col gap-4">
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
                <h1>324 €</h1>
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
                <h1>18</h1>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[202px]">
            <CardContent className="flex flex-col justify-between w-full h-full text-text-primary">
              <div>
                <h4 className=" text-xl font-bold">Currently bidding</h4>
              </div>
              <div className="text-[80px] font-bold leading-none">
                <h1>5</h1>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[202px]">
            <CardContent className="flex flex-col justify-between w-full h-full text-text-primary">
              <div>
                <h4 className=" text-xl font-bold">Currently winning</h4>
              </div>
              <div className="text-[80px] font-bold leading-none text-green-card-winning">
                <h1>2</h1>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="my-auctions" className="w-full flex-1 flex flex-col">
          <div className="flex justify-center">
            <TabsList className="mb-4">
              <TabsTrigger value="my-auctions">My auctions</TabsTrigger>
              <TabsTrigger value="bidding">Bidding</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-auctions" className="flex-1 overflow-y-auto">
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 xs:grid-cols:2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <AuctionCard
                  variant="editable"
                  title="Rode vintage microphone"
                  price="123 €"
                  status="in-progress"
                  timeLeft="30h"
                  onDelete={() => console.log("Delete auction")}
                  onEdit={() => console.log("Edit auction")}
                />
                <AuctionCard
                  variant="editable"
                  title="Old chair"
                  price="65 €"
                  status="in-progress"
                  timeLeft="30h"
                  onDelete={() => console.log("Delete auction")}
                  onEdit={() => console.log("Edit auction")}
                />
                <AuctionCard
                  variant="editable"
                  title="Antique Wooden Table"
                  price="320 €"
                  status="winning"
                  timeLeft="2h"
                  onDelete={() => console.log("Delete auction")}
                  onEdit={() => console.log("Edit auction")}
                />
                <AuctionCard
                  variant="editable"
                  title="Modern Floor Lamp"
                  price="85 €"
                  status="outbid"
                  timeLeft="30h"
                  onDelete={() => console.log("Delete auction")}
                  onEdit={() => console.log("Edit auction")}
                />
                <AuctionCard
                  variant="editable"
                  title="Vintage Bookshelf"
                  price="200 €"
                  status="in-progress"
                  timeLeft="30h"
                  onDelete={() => console.log("Delete auction")}
                  onEdit={() => console.log("Edit auction")}
                />
                <AuctionCard
                  title="Leather Sofa"
                  price="450 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Coffee Table"
                  price="180 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Dining Chairs Set"
                  price="280 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Office Desk"
                  price="150 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Floor Lamp"
                  price="75 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Wall Mirror"
                  price="90 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Storage Cabinet"
                  price="220 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Garden Bench"
                  price="130 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Bar Stools"
                  price="60 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Bookshelf"
                  price="110 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Side Table"
                  price="80 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Desk Lamp"
                  price="45 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Bookshelf"
                  price="120 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Nightstand"
                  price="65 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="TV Stand"
                  price="180 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Armchair"
                  price="250 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Ottoman"
                  price="95 €"
                  status="done"
                  timeLeft=""
                />
                <AuctionCard
                  title="Coffee Table"
                  price="160 €"
                  status="done"
                  timeLeft=""
                />
              </div>
            </div>
        </TabsContent>

          <TabsContent value="bidding" className="flex-1">
            <div className="h-full">
              <h2 className="text-xl font-semibold mb-4">Bidding</h2>
              <div>
                Active bids and bidding history
              </div>
            </div>
          </TabsContent>

          <TabsContent value="won" className="flex-1">
            <div className="h-full">
              <h2 className="text-xl font-semibold mb-4">Won Auctions</h2>
              <div>
                Auctions you've won
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account and view your activity</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, {user?.name || user?.email}
            </span>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Your Profile Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Here you'll be able to:
            </p>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Browse available auctions</li>
              <li>• Create new auctions</li>
              <li>• Place bids on items</li>
              <li>• View your bidding history</li>
              <li>• Manage your account settings</li>
            </ul>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                🚧 This page is still under development. More features coming soon!
              </p>
            </div>
          </div>
        </div>
      </div> */}
    </AppLayout>
  );
}