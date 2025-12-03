'use client';

import { userAPI } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export interface ProfilePictureUploadOptions {
  onSuccess?: () => void;
}

export interface ProfilePictureUploadResult {
  previewUrl: string | null;
  selectedFile: File | null;
  error: string | null;
  isUploading: boolean;
  generatePreview: (file: File) => Promise<void>;
  uploadSelectedFile: () => Promise<void>;
  clearPreview: () => void;
}

export function useProfilePictureUpload(options: ProfilePictureUploadOptions = {}): ProfilePictureUploadResult {
  const { onSuccess } = options;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const validateImageFile = (file: File): string | null => {
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSizeInBytes) {
      return 'Image must be less than 5MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Image must be in JPEG, JPG, PNG, or WebP format';
    }

    return null;
  };

  const generatePreviewFromData = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const response = await userAPI.changeProfilePicture(file);
      return response.profilePictureUrl;
    },
    onSuccess: (profilePictureUrl) => {
      queryClient.setQueryData(['user'], (oldData: any) => {
        if (!oldData) return { profilePictureUrl };
        return {
          ...oldData,
          profilePictureUrl: profilePictureUrl,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      setPreviewUrl(null);
      setSelectedFile(null);
      setError(null);
      onSuccess?.();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const generatePreview = async (file: File) => {
    try {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);

      const preview = await generatePreviewFromData(file);

      setPreviewUrl(preview);
      setSelectedFile(file);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate preview');
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  };

  const uploadSelectedFile = async () => {
    if (!selectedFile) {
      throw new Error('No file selected for upload');
    }

    uploadMutation.mutate(selectedFile);
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
  };

  return {
    previewUrl,
    selectedFile,
    error,
    isUploading: uploadMutation.isPending,
    generatePreview,
    uploadSelectedFile,
    clearPreview,
  };
}