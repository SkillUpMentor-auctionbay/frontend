import axios, { AxiosResponse, AxiosError } from "axios";
import { User, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, AuthError } from "../types/auth";

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

const handleApiError = (error: AxiosError): AuthError => {
  if (error.response) {
    const data = error.response.data as any;
    return {
      message: data?.message || error.message,
      status: error.response.status,
      code: data?.code,
      details: data?.details || data?.validationErrors
    };
  } else if (error.request) {
    return {
      message: "Network error. Please check your connection.",
      code: "NETWORK_ERROR"
    };
  } else {
    return {
      message: error.message || "An unexpected error occurred"
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
  }
};

export default api;