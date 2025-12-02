"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/primitives/logo";
import { NavigationTab } from "@/components/features/layout/navigation-tab";
import { RightNavigation } from "@/components/ui";

export interface NavbarProps {
  activeTab: "auctions" | "profile" | null;
  onTabChange: (tab: "auctions" | "profile") => void;
  className?: string;
}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ activeTab, onTabChange, className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
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
              onNotificationsClick={() => {}}
              onAddClick={() => {}}
            />
          </div>
      </nav>
    );
  }
);

Navbar.displayName = "Navbar";

export { Navbar };
