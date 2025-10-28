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

    // Generate initials from user name and surname
    const initials = generateInitials(user?.name, user?.surname);

    // Determine if we should show the profile picture or fallback
    const showProfilePicture = profilePictureUrl && !error && !isLoading;

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white border border-gray-20 inline-flex h-16 items-center gap-2 p-1 rounded-4xl",
          className
        )}
        {...props}
      >
        {/* Notifications CTA Button - Alternative style */}
        <Button
          variant="alternative"
          buttonStyle="cta"
          icon="Notifications none"
          onClick={onNotificationsClick}
          className="shrink-0"
        />

        {/* Add CTA Button - Primary style */}
        <Button
          variant="primary"
          buttonStyle="cta"
          icon="Add"
          onClick={onAddClick}
          className="shrink-0"
        />

        {/* Avatar - Large size */}
        <div className="relative h-full w-14 shrink-0">
          <Avatar size="lg" className="size-full">
            {showProfilePicture && (
              <AvatarImage
                src={profilePictureUrl}
                alt="User avatar"
                onError={(e) => {
                  // This will be handled by React Query error state
                  // But we keep this as additional safety
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