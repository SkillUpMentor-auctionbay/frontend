"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { getImageUrl } from "@/lib/image-url"
import type { Notification } from "@/types/notification"

interface NotificationItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  notification: Notification
  onClick?: () => void
}

const NotificationItem = React.forwardRef<HTMLAnchorElement, NotificationItemProps>(
  ({ className, notification, onClick, ...props }, ref) => {
    const { id, auctionTitle, imageUrl, price, createdAt } = notification

    // Debug logging to see what data we're getting
    console.log('🔔 NotificationItem debug:', {
      id,
      auctionTitle,
      imageUrl,
      price,
      createdAt,
      priceType: typeof price,
      isNull: price === null,
      isUndefined: price === undefined,
    });

    // Determine status based on price
    const status = price !== null && price !== undefined ? 'won' : 'outbid'

    console.log('🔔 Status determination:', { price, status });

    // Format the date from createdAt to match Figma format (DD.MM.YYYY)
    const formattedDate = new Date(createdAt).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\./g, '.')

    // Handle image loading with fallback
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      // Hide the image and show fallback
      e.currentTarget.style.display = "none"
      const parent = e.currentTarget.parentElement
      if (parent) {
        const fallback = parent.querySelector('.image-fallback') as HTMLElement
        if (fallback) {
          fallback.style.display = "flex"
        }
      }
    }

    return (
      <a
        ref={ref}
        className={cn(
          "flex items-center w-full p-0 hover:bg-gray-5 rounded-lg transition-colors cursor-pointer overflow-hidden",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {/* Image Container - Fixed 40px */}
        <div className="relative rounded-lg shrink-0 size-10 overflow-hidden mr-2">
          {imageUrl ? (
            <>
              <img
                src={getImageUrl(imageUrl)}
                alt={auctionTitle}
                onError={handleImageError}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Fallback for image load error */}
              <div className="absolute inset-0 w-full h-full bg-gray-20 flex items-center justify-center image-fallback" style={{ display: "none" }}>
                <span className="text-gray-50 text-xs">No Image</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-20 flex items-center justify-center">
              <span className="text-gray-50 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Title and Date Container - Takes remaining space */}
        <div className="flex flex-col flex-1 font-light items-start justify-center min-w-0 mr-3 overflow-hidden">
          <p className="leading-6 truncate text-base text-text-primary">
            {auctionTitle}
          </p>
          <p className="leading-3 truncate text-[10px] text-gray-40">
            {formattedDate}
          </p>
        </div>

        {/* Status Badges - Fixed width, doesn't shrink */}
        <div className="flex gap-1 flex-shrink-0">
          {status === 'won' && (
            <Badge variant="winning" size="default">
              Won
            </Badge>
          )}
          {status === 'won' && price && (
            <Badge variant="done" size="default">
              ${price.toFixed(2)}
            </Badge>
          )}
          {status === 'outbid' && (
            <Badge variant="outbid" size="default">
              Outbid
            </Badge>
          )}
        </div>

        {/* Debug: Always show status for testing */}
        <div className="flex gap-1 flex-shrink-0">
          <span className="text-xs text-gray-40 bg-gray-80 px-1 rounded">
            {status}
          </span>
        </div>
      </a>
    )
  }
)

NotificationItem.displayName = "NotificationItem"

export { NotificationItem }