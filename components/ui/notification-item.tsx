"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "./badge"
import { getImageUrl } from "@/lib/image-url"
import { ImageFallback } from "./image-fallback"
import type { Notification } from "@/types/notification"
import { formatDateForDisplay } from "@/utils/dateUtils"

interface NotificationItemProps {
  notification: Notification
  onClick?: () => void
  className?: string
}

const formatPrice = (price: number) => {
  return '€' + price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}


const NotificationItem = ({ className, notification, onClick }: NotificationItemProps) => {
  const { auctionId, auctionTitle, imageUrl, price, createdAt } = notification
  const title = auctionTitle || 'Unknown Auction'
  const status = price !== null && price !== undefined ? 'won' : 'outbid'
  const [imageError, setImageError] = React.useState(false)

  const handleImageError = React.useCallback(() => {
    setImageError(true)
  }, [])

  const renderBadges = () => {
    const badges = []

    if (status === 'won') {
      badges.push(<Badge key="won" variant="winning">Won</Badge>)
    } else {
      badges.push(<Badge key="outbid" variant="outbid">Outbid</Badge>)
    }

    if (status === 'won' && price) {
      badges.push(<Badge key="price" variant="done">{formatPrice(price)}eur</Badge>)
    } else {
      badges.push(<Badge key="done" variant="done">Done</Badge>)
    }

    return badges
  }

  return (
    <Link
      href={auctionId ? '/auctions/' + auctionId : '#'}
      className={'grid grid-cols-[40px_1fr_auto] gap-2 items-center w-full p-2 hover:bg-gray-5 rounded-lg transition-colors cursor-pointer ' + (className || '')}
      onClick={onClick}
    >
      <div className="relative rounded shrink-0 w-10 h-10 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={getImageUrl(imageUrl)}
            alt={title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <ImageFallback
            text="No Image!"
            className="w-full h-full"
            fallbackType="text"
          />
        )}
      </div>

      <div className="flex flex-col font-light items-start justify-center min-w-0 overflow-hidden">
        <p 
          className="leading-6 truncate text-base text-text-primary" 
          title={title.length > 30 ? title : undefined}
        >
          {title.length > 30 ? title.substring(0, 30) + '...' : title}
        </p>
        <p className="leading-3 text-xs text-gray-40">
          {formatDateForDisplay(createdAt)}
        </p>
      </div>

      <div className="flex gap-2 items-center">
        {renderBadges()}
      </div>
    </Link>
  )
}

export { NotificationItem }