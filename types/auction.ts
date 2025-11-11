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