"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import { useProfilePicture } from "@/hooks/useProfilePicture"
import { generateInitials } from "@/utils/imageUtils"
import { CreateAuctionDialog } from "@/components/auctions/create-auction-dialog"
import { ProfilePopover } from "@/components/profile/profile-popover"

export interface RightNavigationProps {
  className?: string
  onNotificationsClick?: () => void
  onAddClick?: () => void
}

const RightNavigation = React.forwardRef<HTMLDivElement, RightNavigationProps>(
  ({ className, onNotificationsClick, onAddClick, ...props }, ref) => {
    const { user } = useAuth();
    const { data: profilePictureUrl, isLoading, error } = useProfilePicture();

    const initials = generateInitials(user?.name, user?.surname);
    const showProfilePicture = profilePictureUrl && !error && !isLoading;

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-16 items-center gap-2 p-1 rounded-4xl bg-white",
          className
        )}
        {...props}
      >
        <Button
          variant="alternative"
          buttonStyle="cta"
          icon="Notifications none"
          onClick={onNotificationsClick}
          className="shrink-0"
        />

        <CreateAuctionDialog>
          <Button
            variant="primary"
            buttonStyle="cta"
            icon="Add"
            className="shrink-0"
          />
        </CreateAuctionDialog>

        <Popover>
          <PopoverTrigger asChild>
            <div className="relative h-full w-14 shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar size="lg" className="size-full">
                {showProfilePicture && (
                  <AvatarImage
                    src={profilePictureUrl}
                    alt="User avatar"
                    onError={(e) => {
                      console.error('Avatar image failed to load:', e);
                    }}
                  />
                )}
                <AvatarFallback className="bg-primary-50 text-gray-90 font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-64 p-0">
            <ProfilePopover />
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

RightNavigation.displayName = "RightNavigation"

export { RightNavigation }