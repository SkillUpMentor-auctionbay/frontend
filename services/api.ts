import axios, { AxiosResponse, AxiosError } from "axios";
import { User, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, AuthError } from "../types/auth";
import { CreateAuctionRequest, CreateAuctionResponse, ImageUploadResponse, AuctionError } from "../types/auction";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

const handleApiError = (error: AxiosError): AuthError | AuctionError => {
  console.log(`🔍 [handleApiError] Processing error:`, {
    hasResponse: !!error.response,
    hasRequest: !!error.request,
    hasMessage: !!error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    timestamp: new Date().toISOString()
  });

  if (error.response) {
    const data = error.response.data as any;
    const message = data?.message ||
                   (error.response.status === 401 ? "Authentication required. Please log in again." :
                    error.response.status === 403 ? "You don't have permission to perform this action." :
                    error.response.status === 404 ? "The requested resource was not found." :
                    error.response.status === 422 ? "Invalid data provided." :
                    error.response.status === 500 ? "Server error. Please try again later." :
                    error.message || "An error occurred");

    return {
      message,
      status: error.response.status,
      code: data?.code || `HTTP_${error.response.status}`,
      details: data?.details || data?.validationErrors
    };
  } else if (error.request) {
    return {
      message: "Network error. Please check your internet connection and try again.",
      code: "NETWORK_ERROR"
    };
  } else {
    return {
      message: error.message || "An unexpected error occurred",
      code: "UNKNOWN_ERROR"
    };
  }
};

// Auth API functions
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response: AxiosResponse<LoginResponse> = await api.post("/api/v1/auth/login", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response: AxiosResponse<RegisterResponse> = await api.post("/api/v1/auth/signup", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  logout: async (): Promise<void> => {
    try {
      const response: AxiosResponse<void> = await api.post("/api/v1/auth/logout");
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  me: async (): Promise<LoginResponse["user"]> => {
    try {
      const response: AxiosResponse<LoginResponse["user"]> = await api.get("/api/v1/users/me");
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// Auctions API functions
export const auctionsAPI = {
  getAuctions: async (filter: "ALL" | "OWN" | "BID" | "WON" = "ALL", page = 1, limit = 50) => {
    console.log(`🚀 [auctionsAPI.getAuctions] Making API request:`, {
      filter,
      page,
      limit,
      url: "/api/v1/auctions",
      timestamp: new Date().toISOString()
    });

    try {
      const response: AxiosResponse = await api.get("/api/v1/auctions", {
        params: { filter, page, limit }
      });

      console.log(`📥 [auctionsAPI.getAuctions] API Response received:`, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: {
          auctionsCount: response.data?.auctions?.length || 0,
          pagination: response.data?.pagination,
          totalAuctions: response.data?.pagination?.total || 0,
          sampleAuction: response.data?.auctions?.[0] || null
        },
        responseTime: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error(`❌ [auctionsAPI.getAuctions] API Error:`, {
        filter,
        page,
        limit,
        error: error,
        timestamp: new Date().toISOString()
      });
      throw handleApiError(error as AxiosError);
    }
  },

  createAuction: async (data: CreateAuctionRequest): Promise<CreateAuctionResponse> => {
    console.log(`🚀 [auctionsAPI.createAuction] Creating auction:`, {
      title: data.title,
      startingPrice: data.startingPrice,
      endTime: data.endTime,
      timestamp: new Date().toISOString()
    });

    try {
      const response: AxiosResponse<CreateAuctionResponse> = await api.post("/api/v1/auctions/me/auction", data);

      console.log(`📥 [auctionsAPI.createAuction] Auction created successfully:`, {
        auctionId: response.data.auction.id,
        status: response.status,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error(`❌ [auctionsAPI.createAuction] Failed to create auction:`, {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        axiosError: error && typeof error === 'object' && 'isAxiosError' in error ? error : undefined,
        errorResponse: error && typeof error === 'object' && 'response' in error ? (error as any).response : undefined,
        timestamp: new Date().toISOString()
      });
      throw handleApiError(error as AxiosError);
    }
  },

  uploadAuctionImage: async (auctionId: string, imageFile: File): Promise<ImageUploadResponse> => {
    console.log(`🚀 [auctionsAPI.uploadAuctionImage] Uploading image for auction:`, {
      auctionId,
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
      timestamp: new Date().toISOString()
    });

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response: AxiosResponse<ImageUploadResponse> = await api.post(
        `/api/v1/auctions/${auctionId}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(`📥 [auctionsAPI.uploadAuctionImage] Image uploaded successfully:`, {
        auctionId,
        imageUrl: response.data.imageUrl,
        status: response.status,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error(`❌ [auctionsAPI.uploadAuctionImage] Failed to upload image:`, {
        auctionId,
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        axiosError: error && typeof error === 'object' && 'isAxiosError' in error ? error : undefined,
        errorResponse: error && typeof error === 'object' && 'response' in error ? (error as any).response : undefined,
        timestamp: new Date().toISOString()
      });
      throw handleApiError(error as AxiosError);
    }
  }
};

export default api;