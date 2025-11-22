// Backend API response types
export interface NotificationDto {
  id: string
  price?: number | null
  createdAt: string
  auction: {
    id: string
    title: string
    imageUrl?: string
    endTime: string
  }
}

export interface NotificationsResponse {
  notifications: NotificationDto[]
  total: number
}

// Frontend internal types
export interface Notification {
  id: string
  auctionId: string
  auctionTitle: string
  imageUrl?: string
  endTime: string
  price: number | null // null for outbid, number for won
  createdAt: string
}

export type NotificationStatus = 'won' | 'outbid'

// Helper function to convert backend DTO to frontend interface
export const notificationDtoToNotification = (dto: NotificationDto): Notification => {
  const notification = {
    id: dto.id,
    auctionId: dto.auction.id,
    auctionTitle: dto.auction.title,
    imageUrl: dto.auction.imageUrl,
    endTime: dto.auction.endTime,
    price: dto.price || null,
    createdAt: dto.createdAt,
  };

  console.log(`🔄 Converting notification DTO:`, {
    input: dto,
    output: notification
  });

  return notification;
}