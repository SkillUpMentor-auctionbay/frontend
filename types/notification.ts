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

export interface Notification {
  id: string
  auctionId: string
  auctionTitle: string
  imageUrl?: string
  endTime: string
  price: number | null
  createdAt: string
}

export type NotificationStatus = 'won' | 'outbid'

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

  return notification;
}