import {
  AuctionError,
  CreateAuctionRequest,
  CreateAuctionResponse,
  DetailedAuctionResponse,
  ImageUploadResponse,
  PlaceBidRequest,
  PlaceBidResponse,
  UpdateAuctionRequest,
  UpdateAuctionResponse,
} from '@/types/auction';
import {
  AuthError,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from '@/types/auth';
import { NotificationsResponse } from '@/types/notification';
import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLogoutRequest = error.config?.url?.includes('/logout');
      const isPasswordChangeRequest = error.config?.url?.includes('/update-password');

      if (!isLogoutRequest && !isPasswordChangeRequest && typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  },
);

const handleApiError = (error: AxiosError): AuthError | AuctionError => {
  if (error.response) {
    const data = error.response.data as any;
    const message =
      data?.message ||
      data?.error ||
      data?.error_description ||
      data?.detail ||
      (Array.isArray(data?.message) ? data.message.join(', ') : null) ||
      (error.response.status === 401
        ? 'Authentication required. Please log in again.'
        : error.response.status === 403
          ? "You don't have permission to perform this action."
          : error.response.status === 404
            ? 'The requested resource was not found.'
            : error.response.status === 422
              ? 'Invalid data provided. Please check your input.'
              : error.response.status === 500
                ? 'Server error. Please try again later.'
                : error.response.status === 400
                  ? 'Bad request. Please check your input.'
                  : `HTTP ${error.response.status}: ${error.response.statusText || 'Unknown error'}`);

    return {
      message,
      status: error.response.status,
      code: data?.code || data?.error?.code || `HTTP_${error.response.status}`,
      details:
        data?.details ||
        data?.validationErrors ||
        data?.errors ||
        data?.fieldErrors,
    };
  } else if (error.request) {
    return {
      message:
        'Network error. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
    };
  } else {
    let message = error.message || 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';

    if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please try again.';
      code = 'TIMEOUT_ERROR';
    } else if (error.message?.includes('Network Error')) {
      message =
        'Network connection failed. Please check your internet connection.';
      code = 'NETWORK_ERROR';
    }

    return { message, code };
  }
};

const handleApiErrorWithToast = async (
  error: AxiosError,
  operation: string = 'operation',
): Promise<AuthError | AuctionError> => {
  const errorData = handleApiError(error);

  if (error.config?.method?.toLowerCase() !== 'get') {
    const { toast } = await import('sonner');

    toast.error(`${operation} failed`, {
      description: errorData.message,
      duration: 5000,
    });
  }

  return errorData;
};

// Auth API functions
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response: AxiosResponse<LoginResponse> = await api.post(
        '/api/v1/auth/login',
        data,
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response: AxiosResponse<RegisterResponse> = await api.post(
        '/api/v1/auth/signup',
        data,
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  logout: async (): Promise<void> => {
    try {
      const response: AxiosResponse<void> = await api.post(
        '/api/v1/auth/logout',
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  me: async (): Promise<LoginResponse['user']> => {
    try {
      const response: AxiosResponse<LoginResponse['user']> =
        await api.get('/api/v1/users/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// Auctions API functions
export const auctionsAPI = {
  getAuctions: async (
    filter: 'ALL' | 'OWN' | 'BID' | 'WON' = 'ALL',
    page = 1,
    limit = 500,
  ) => {
    try {
      const response: AxiosResponse = await api.get('/api/v1/auctions', {
        params: { filter, page, limit },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  getAuctionById: async (
    auctionId: string,
  ): Promise<DetailedAuctionResponse> => {
    try {
      const response: AxiosResponse<DetailedAuctionResponse> = await api.get(
        `/api/v1/auctions/${auctionId}`,
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  createAuction: async (
    data: CreateAuctionRequest,
  ): Promise<CreateAuctionResponse> => {
    try {
      const response: AxiosResponse<CreateAuctionResponse> = await api.post(
        '/api/v1/auctions/me/auction',
        data,
      );

      return response.data;
    } catch (error) {
      throw await handleApiErrorWithToast(
        error as AxiosError,
        'Auction creation',
      );
    }
  },

  uploadAuctionImage: async (
    auctionId: string,
    imageFile: File,
  ): Promise<ImageUploadResponse> => {
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
        },
      );

      return response.data;
    } catch (error) {
      throw await handleApiErrorWithToast(error as AxiosError, 'Image upload');
    }
  },

  updateAuction: async (
    auctionId: string,
    data: UpdateAuctionRequest,
  ): Promise<UpdateAuctionResponse> => {
    try {
      const requestData = data || {};
      const requestUrl = `/api/v1/auctions/me/auction/${auctionId}`;

      const response: AxiosResponse<UpdateAuctionResponse> = await api.patch(
        requestUrl,
        requestData,
      );
      return response.data;
    } catch (error) {
      throw await handleApiErrorWithToast(
        error as AxiosError,
        'Auction update',
      );
    }
  },

  deleteAuction: async (auctionId: string): Promise<void> => {
    try {
      const requestUrl = `/api/v1/auctions/me/auction/${auctionId}`;

      await api.delete(requestUrl);
    } catch (error) {
      throw await handleApiErrorWithToast(
        error as AxiosError,
        'Auction deletion',
      );
    }
  },
};

// User Profile API functions
export const userAPI = {
  updateUserProfile: async (
    data: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> => {
    try {
      const response: AxiosResponse<UpdateUserProfileResponse> =
        await api.patch('/api/v1/users/me/update-profile', data);

      return response.data;
    } catch (error) {
      throw await handleApiErrorWithToast(
        error as AxiosError,
        'Profile update',
      );
    }
  },

  changePassword: async (
    data: UpdatePasswordRequest,
  ): Promise<UpdatePasswordResponse> => {
    try {
      const response: AxiosResponse<UpdatePasswordResponse> = await api.patch(
        '/api/v1/users/me/update-password',
        data,
      );

      return response.data;
    } catch (error) {
      throw await handleApiErrorWithToast(
        error as AxiosError,
        'Password change',
      );
    }
  },

  changeProfilePicture: async (
    file: File,
  ): Promise<{ profilePictureUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<{ profilePictureUrl: string }> =
        await api.patch('/api/v1/users/me/change-profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

      return response.data;
    } catch (error) {
      throw await handleApiErrorWithToast(
        error as AxiosError,
        'Profile picture upload',
      );
    }
  },

  removeProfilePicture: async (): Promise<void> => {
    try {
      await api.delete('/api/v1/users/me/remove-profile-picture');
    } catch (error) {
      throw await handleApiErrorWithToast(
        error as AxiosError,
        'Profile picture removal',
      );
    }
  },

  getStatistics: async () => {
    try {
      const response: AxiosResponse = await api.get(
        '/api/v1/users/me/statistics',
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// Bidding API functions
export const biddingAPI = {
  placeBid: async (
    auctionId: string,
    data: PlaceBidRequest,
  ): Promise<PlaceBidResponse> => {
    try {
      const response: AxiosResponse<PlaceBidResponse> = await api.post(
        `/api/v1/auctions/${auctionId}/bid`,
        data,
      );
      return response.data;
    } catch (error) {
      throw await handleApiErrorWithToast(error as AxiosError, 'Bid placement');
    }
  },
};

// Notifications API functions
export const notificationsAPI = {
  getNotifications: async (): Promise<NotificationsResponse> => {
    try {
      const response: AxiosResponse<NotificationsResponse> = await api.get(
        '/api/v1/notifications',
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  clearAllNotifications: async (): Promise<void> => {
    try {
      await api.patch('/api/v1/notifications/clear-all');
    } catch (error) {
      throw await handleApiErrorWithToast(
        error as AxiosError,
        'Notifications clear',
      );
    }
  },
};

export default api;
