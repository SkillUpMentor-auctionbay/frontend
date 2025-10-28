"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export interface NavigationTabProps {
  activeTab: "auctions" | "profile";
  onTabChange: (tab: "auctions" | "profile") => void;
  className?: string;
}

const NavigationTab = React.forwardRef<HTMLDivElement, NavigationTabProps>(
  ({ activeTab, onTabChange, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white inline-flex items-center gap-2 justify-center p-1 rounded-4xl h-16",
          className
        )}
        {...props}
      >
        <button
          onClick={() => onTabChange("auctions")}
          className={cn(
            "inline-flex items-center font-normal justify-center gap-1 px-4 py-2 rounded-full text-base transition-all duration-300 ease-in-out min-h-14 hover:cursor-pointer",
            activeTab === "auctions"
              ? " bg-gray-50 text-white "
              : "hover:text-gray-900"
          )}
        >
          <Icon
            name="Home"
            size={24}
            color={activeTab === "auctions" ? "text-white" : "text-gray-700"}
          />
          Auctions
        </button>

        <button
          onClick={() => onTabChange("profile")}
          className={cn(
            "inline-flex items-center font-normal justify-center gap-2 px-4 py-2 rounded-full text-base transition-all duration-300 ease-in-out min-h-14 hover:cursor-pointer",
            activeTab === "profile"
              ? "bg-gray-50 text-white "
              : "text-gray-900"
          )}
        >
          <Icon
            name="Person"
            size={24}
            color={activeTab === "profile" ? "text-white" : "text-gray-700"}
          />
          Profile
        </button>
      </div>
    );
  }
);

NavigationTab.displayName = "NavigationTab";

export { NavigationTab };