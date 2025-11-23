"use client"

import * as React from "react"
import { Button } from "./button"
import { ScrollArea } from "./scroll-area"
import { NotificationItem } from "./notification-item"
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery"
import { useClearAllNotificationsMutation } from "@/hooks/useNotificationsMutations"
import { useAuth } from "@/contexts/AuthContext"
import type { Notification } from "@/types/notification"

interface NotificationsPopoverProps {
  onNotificationClick?: (notification: Notification) => void
  className?: string
}

const NotificationsPopover = ({ onNotificationClick, className }: NotificationsPopoverProps) => {
  const { user } = useAuth()
  const { data, isLoading, refetch } = useNotificationsQuery()
  const { clearAllNotifications, isLoading: isClearing } = useClearAllNotificationsMutation()

  const isEmpty = !data?.notifications?.length
  const notifications = data?.notifications ?? []

  React.useEffect(() => {
    if (user?.id) {
      refetch()
    }
  }, [user?.id, refetch])

  const handleClearAll = async () => {
    clearAllNotifications()
  }

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification)
  }

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <p className="font-light text-base text-text-tertiary">Loading notifications...</p>
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <p className="font-light text-base text-text-tertiary">No notifications.</p>
    </div>
  )

  const NotificationsList = () => (
    <ScrollArea className="h-80 w-full">
      <div className="flex flex-col gap-4">
        {notifications.map((notification: Notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => handleNotificationClick(notification)}
          />
        ))}
      </div>
    </ScrollArea>
  )

  return (
    <div className={'bg-white flex flex-col gap-4 items-start p-4 rounded-2xl w-[418px] ' + (className || '')}>
      <div className="flex gap-4 items-center justify-between w-full">
        <h4 className="font-bold text-[23px] text-black leading-[1.2]">Notifications</h4>
        <Button
          variant="tertiary"
          size="default"
          onClick={handleClearAll}
          disabled={isEmpty || isClearing}
          className="h-10 border-0"
        >
          {isClearing ? "Clearing..." : "Clear all"}
        </Button>
      </div>

      <div className="w-full">
        {isLoading ? (
          <LoadingState />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <NotificationsList />
        )}
      </div>
    </div>
  )
}

export { NotificationsPopover }
