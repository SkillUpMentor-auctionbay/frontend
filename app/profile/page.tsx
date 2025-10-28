"use client";

import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { AppLayout } from "../../components/layout/app-layout";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </AppLayout>
  );
}