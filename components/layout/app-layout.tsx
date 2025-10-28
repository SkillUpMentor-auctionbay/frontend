"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export interface AppLayoutProps {
  children: React.ReactNode;
  showProtectedRoute?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showProtectedRoute = true
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = (): "auctions" | "profile" => {
    if (pathname === "/profile") {
      return "profile";
    }
    return "auctions";
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: "auctions" | "profile") => {
    if (tab === "auctions") {
      router.push("/auctions");
    } else if (tab === "profile") {
      router.push("/profile");
    }
  };

  const content = (
    <div className="min-h-screen bg-background">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <main className="h-[calc(100vh-104px)]">
        {children}
      </main>
    </div>
  );

  if (showProtectedRoute) {
    return <ProtectedRoute>{content}</ProtectedRoute>;
  }

  return content;
};

export { AppLayout };