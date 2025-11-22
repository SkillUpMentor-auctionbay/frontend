"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { ScrollArea } from "./scroll-area"
import { NotificationItem } from "./notification-item"
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery";
import { useClearAllNotificationsMutation } from "@/hooks/useNotificationsMutations";
import { useAuth } from "@/contexts/AuthContext";
import type { Notification } from "@/types/notification"

interface NotificationsPopoverProps {
  onNotificationClick?: (notification: Notification) => void
  className?: string
}

const NotificationsPopover = React.forwardRef<HTMLDivElement, NotificationsPopoverProps>(
  ({ onNotificationClick, className, ...props }, ref) => {
    const { user } = useAuth();

    // Fetch notifications data (SSE connection is now global in AppLayout)
    const { data, isLoading, error, refetch } = useNotificationsQuery();

    // Debug: Log what data we're receiving
    React.useEffect(() => {
      console.log('📋 NotificationsPopover received data:', {
        data,
        isLoading,
        error,
        notificationsCount: data?.notifications?.length || 0,
        notifications: data?.notifications?.slice(0, 2) // Show first 2 notifications for debugging
      });
    }, [data, isLoading, error]);

    // Force refetch on mount to clear any cached issues
    React.useEffect(() => {
      if (user?.id) {
        console.log('🔄 Forcing notification refetch on mount for user:', user.id);
        refetch();
      }
    }, [user?.id, refetch]);

    // Clear all mutation
    const { clearAllNotifications, isLoading: isClearing } = useClearAllNotificationsMutation();

    const isEmpty = !data?.notifications || data.notifications.length === 0;
    const notifications = data?.notifications || [];

    const handleClearAll = async () => {
      await clearAllNotifications();
    };

    const handleNotificationClick = (notification: Notification) => {
      // Navigate to auction or handle click
      console.log('Notification clicked:', notification);
      onNotificationClick?.(notification);
    };

    if (error) {
      console.error('❌ Error loading notifications:', error);
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white flex flex-col gap-4 items-start p-4 rounded-2xl w-[418px]",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex gap-4 items-center justify-between w-full">
          <h4 className="font-bold text-[23px] text-black leading-[1.2]">
            Notifications
          </h4>
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

        {/* Content */}
        <div className="w-full">
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-8">
              <p className="font-light text-base text-text-tertiary">
                Loading notifications...
              </p>
            </div>
          ) : isEmpty ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-8">
              <p className="font-light text-base text-text-tertiary">
                No notifications.
              </p>
            </div>
          ) : (
            // Notifications List
            <ScrollArea className="h-80 w-full">
              <div className="flex flex-col gap-4">
                {notifications.map((notification: any) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    )
  }
)

NotificationsPopover.displayName = "NotificationsPopover"

export { NotificationsPopover }