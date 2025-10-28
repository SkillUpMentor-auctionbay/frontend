"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { NavigationTab } from "@/components/ui/navigation-tab";
import { RightNavigation } from "@/components/ui/right-navigation";

export interface NavbarProps {
  activeTab: "auctions" | "profile";
  onTabChange: (tab: "auctions" | "profile") => void;
  className?: string;
}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ activeTab, onTabChange, className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "border-b border-gray-200",
          className
        )}
        {...props}
      >
          <div className="py-5 px-8 flex justify-between items-center">
            <div className="flex gap-8">
              <Logo size="md" />
              <NavigationTab
                activeTab={activeTab}
                onTabChange={onTabChange}
              />
            </div>
            <RightNavigation
              onNotificationsClick={() => console.log('Notifications clicked')}
              onAddClick={() => console.log('Add clicked')}
            />
          </div>
      </nav>
    );
  }
);

Navbar.displayName = "Navbar";

export { Navbar };