"use client";

import { useMutation } from "@tanstack/react-query";
import { userAPI } from "../services/api";

export interface ProfilePictureUploadError {
  message: string;
  code: string;
  details?: any;
}

// File validation function
const validateProfilePicture = (file: File): string | null => {
  // File size validation (5MB max)
  const maxSizeInBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return "Image must be less than 5MB";
  }

  // File type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return "Image must be in JPEG, JPG, PNG, or WebP format";
  }

  return null; // No errors
};

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
      console.log(`📸 [useProfilePictureUpload] Starting profile picture upload`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString()
      });

      // Validate file
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

        console.log(`✅ [useProfilePictureUpload] Profile picture upload complete`, {
          imageUrl: response.imageUrl,
          timestamp: new Date().toISOString()
        });

        return response;
      } catch (error) {
        console.error(`❌ [useProfilePictureUpload] Failed to upload profile picture`, {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });

        // Ensure we're throwing a proper error
        if (error && typeof error === 'object' && 'message' in error) {
          throw error as ProfilePictureUploadError;
        } else if (error instanceof Error) {
          const uploadError: ProfilePictureUploadError = {
            message: error.message,
            code: 'UPLOAD_ERROR'
          };
          throw uploadError;
        } else {
          const uploadError: ProfilePictureUploadError = {
            message: 'Failed to upload profile picture',
            code: 'UNKNOWN_ERROR'
          };
          throw uploadError;
        }
      }
    },
    onSuccess: (data) => {
      console.log(`🎉 [useProfilePictureUpload] Upload successful:`, {
        imageUrl: data.imageUrl
      });
      onSuccess?.(data.imageUrl);
    },
    onError: (error) => {
      console.error(`💥 [useProfilePictureUpload] Upload failed:`, error);
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