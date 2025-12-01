"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlays/dialog"
import { ProfileSettings, type ProfileSettingsData, type PasswordData, type ViewType, getViewTitle } from "./profile-settings"

export interface ProfileSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: ProfileSettingsData | PasswordData) => Promise<void>
}

const ProfileSettingsDialog = React.forwardRef<HTMLDivElement, ProfileSettingsDialogProps>(
  ({ open, onOpenChange, onSubmit, ...props }, ref) => {
    const [currentView, setCurrentView] = React.useState<ViewType>('profile')

    const handleSubmit = async (data: ProfileSettingsData | PasswordData) => {
      await onSubmit?.(data)
      onOpenChange(false)
    }

    const handleCancel = () => {
      onOpenChange(false)
    }

    const handleViewChange = (view: ViewType) => {
      setCurrentView(view)
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[533px] p-0 border-none bg-transparent shadow-none"
          showCloseButton={false}
        >
          <div
            ref={ref}
            className="bg-white rounded-2xl p-4 flex flex-col gap-8 w-full max-w-[533px]"
            {...props}
          >
            <div className="flex items-center justify-between">
              <DialogTitle className="font-bold text-[23px] leading-[1.2] text-gray-90">
                {getViewTitle(currentView)}
              </DialogTitle>
            </div>

            <ProfileSettings
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              onViewChange={handleViewChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)

ProfileSettingsDialog.displayName = "ProfileSettingsDialog"

export { ProfileSettingsDialog }