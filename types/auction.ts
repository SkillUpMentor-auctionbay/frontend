export interface CreateAuctionRequest {
  title: string;
  description: string;
  startingPrice: number;
  endTime: string;
  imageUrl?: string;
}

export interface CreateAuctionResponse {
  message: string;
  auction: {
    id: string;
    title: string;
    description: string;
    startingPrice: number;
    currentPrice: number;
    endTime: string;
    imageUrl?: string;
    sellerId: string;
    createdAt: string;
    updatedAt: string;
    status: string;
  };
}

export interface ImageUploadResponse {
  message: string;
  imageUrl: string;
}

export interface AuctionError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  validationErrors?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AuctionFormData {
  title: string;
  description: string;
  startingPrice: string;
  endDate: string;
  image?: File;
}

export interface FormValidationErrors {
  title?: string;
  description?: string;
  startingPrice?: string;
  endDate?: string;
  image?: string;
  amount?: string;
  general?: string;
}

export interface AuctionData {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  endTime: string;
  imageUrl?: string;
  sellerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditAuctionFormData {
  id: string;
  title: string;
  description: string;
  startingPrice: string;
  endDate: string;
  image?: File;
  existingImageUrl?: string;
  success?: boolean;
}

export interface UpdateAuctionRequest {
  title?: string;
  description?: string;
  endTime?: string;
  imageUrl?: string;
}

export interface UpdateAuctionResponse {
  message: string;
  auction: AuctionData;
}

export interface Seller {
  id: string;
  name: string;
  surname: string;
  profilePictureUrl?: string;
}

export interface Bidder {
  id: string;
  name: string;
  surname: string;
  profilePictureUrl?: string;
}

export interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  bidder: Bidder;
}

export interface DetailedAuctionResponse {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startingPrice: number;
  currentPrice: number;
  endTime: string;
  status: 'IN_PROGRESS' | 'WINNING' | 'OUTBID' | 'DONE';
  myBid?: number;
  bidCount: number;
  seller: Seller;
  createdAt: string;
  bids: Bid[];
}

export interface PlaceBidRequest {
  amount: number;
}

export interface PlaceBidResponse {
  message: string;
  bid: Bid;
}

export interface BidFormData {
  amount: string;
}

export interface AuctionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuctionsResponse {
  auctions: AuctionData[];
  pagination: AuctionPagination;
}
