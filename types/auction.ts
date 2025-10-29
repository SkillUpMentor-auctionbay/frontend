// Auction-related types for the frontend

export interface CreateAuctionRequest {
  title: string;
  description: string;
  startingPrice: number;
  endTime: string; // ISO date string
  imageUrl?: string; // Optional, will be set after image upload if provided
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

// Form validation types
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