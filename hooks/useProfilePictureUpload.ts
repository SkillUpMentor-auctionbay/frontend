"use client";

import { useMutation } from "@tanstack/react-query";
import { userAPI } from "@/services/api";
import { validateProfilePicture } from "@/utils/auctionValidation";
import { normalizeAuctionError } from "@/utils/errorUtils";

export interface ProfilePictureUploadError {
  message: string;
  code: string;
  details?: any;
}

export interface UseProfilePictureUploadOptions {
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: ProfilePictureUploadError) => void;
}

export function useProfilePictureUpload(options: UseProfilePictureUploadOptions = {}) {
  const { onSuccess, onError } = options;

  const uploadMutation = useMutation<
    { imageUrl: string },
    ProfilePictureUploadError,
    File
  >({
    mutationFn: async (file) => {
      const validationError = validateProfilePicture(file);
      if (validationError) {
        const error: ProfilePictureUploadError = {
          message: validationError,
          code: 'VALIDATION_ERROR'
        };
        throw error;
      }

      try {
        const response = await userAPI.changeProfilePicture(file);
        return response;
      } catch (error) {
        throw normalizeAuctionError(error) as ProfilePictureUploadError;
      }
    },
    onSuccess: (data) => {
      onSuccess?.(data.imageUrl);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    uploadProfilePicture: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
    data: uploadMutation.data,
    reset: uploadMutation.reset,
  };
}