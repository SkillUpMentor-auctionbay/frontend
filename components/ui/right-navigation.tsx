"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useProfilePicture } from "@/hooks/useProfilePicture"
import { generateInitials } from "@/utils/imageUtils"

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

        <Button
          variant="primary"
          buttonStyle="cta"
          icon="Add"
          onClick={onAddClick}
          className="shrink-0"
        />

        <div className="relative h-full w-14 shrink-0">
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
      </div>
    )
  }
)

RightNavigation.displayName = "RightNavigation"

export { RightNavigation }