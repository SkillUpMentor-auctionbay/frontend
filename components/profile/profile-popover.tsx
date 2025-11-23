"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { ProfileSettingsDialog } from "./profile-settings-dialog"

export interface ProfilePopoverProps {
  className?: string
  onSettingsClick?: () => void
  onLogoutClick?: () => void
}

const ProfilePopover = React.forwardRef<HTMLDivElement, ProfilePopoverProps>(
  ({ className, onSettingsClick, onLogoutClick, ...props }, ref) => {
    const { logout, isLoggingOut } = useAuth()
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false)

    const handleSettingsClick = () => {
      if (onSettingsClick) {
        onSettingsClick()
      } else {
        setIsSettingsDialogOpen(true)
      }
    }

  const handleProfileSettingsDialogChange = (open: boolean) => {
      setIsSettingsDialogOpen(open)
    }

    const handleLogoutClick = async () => {
      if (onLogoutClick) {
        onLogoutClick()
      } else {
        try {
          await logout()
        } catch (error) {
          console.error('Logout failed:', error)
        }
      }
    }

    return (
      <>
        <div
          ref={ref}
          className={className}
          {...props}
        >
          <div className="flex flex-col gap-[17px] items-start p-4">
            {/* Settings Button */}
            <Button
              variant="ghost"
              onClick={handleSettingsClick}
              className="w-full"
            >
              <Icon
                name="Settings"
                size={16}
                className="shrink-0"
              />
              <span className="font-medium text-base leading-6 text-gray-90">
                Profile settings
              </span>
            </Button>

            {/* Log out Button */}
            <Button
              variant="outline"
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="flex gap-2 items-center justify-center min-h-10 px-4 py-2 rounded-2xl w-full border border-gray-50 hover:bg-gray-10 hover:border-gray-60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium text-base leading-6 text-gray-90">
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </span>
            </Button>
          </div>
        </div>

        {/* Profile Settings Dialog */}
        <ProfileSettingsDialog
          open={isSettingsDialogOpen}
          onOpenChange={handleProfileSettingsDialogChange}
        />
      </>
    )
  }
)

ProfilePopover.displayName = "ProfilePopover"

export { ProfilePopover }