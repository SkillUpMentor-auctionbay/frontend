"use client";

import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";

export default function AuctionsPage() {
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Auction Bay</h1>
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
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Auctions
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              This is your home page as an authenticated user.
            </p>

            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Your Dashboard</h3>
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
        </main>
      </div>
    </ProtectedRoute>
  );
}