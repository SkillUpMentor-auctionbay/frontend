import { useState, useCallback } from 'react';
import { useAuctionValidation } from './useAuctionValidation';

interface ImageState {
  preview: string | null;
  existingUrl: string | undefined;
  error: boolean;
  hasChanges: boolean;
  validationError: string | null;
}

export function useAuctionImage(existingImageUrl?: string, mode: 'create' | 'edit' = 'create') {
  const [imageState, setImageState] = useState<ImageState>({
    preview: null,
    existingUrl: existingImageUrl,
    error: false,
    hasChanges: false,
    validationError: null,
  });

  const { validateField } = useAuctionValidation(mode);

  const handleImageSelect = useCallback((file: File) => {
    const validationError = validateField('image', '', {
      title: '',
      description: '',
      startingPrice: '',
      endDate: '',
      image: file
    } as any);

    if (validationError) {
      setImageState(prev => ({
        ...prev,
        error: true,
        preview: null,
        validationError: validationError,
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageState(prev => ({
        ...prev,
        preview: reader.result as string,
        error: false,
        hasChanges: true,
        validationError: null,
      }));
    };
    reader.onerror = () => {
      setImageState(prev => ({
        ...prev,
        error: true,
        preview: null,
        validationError: 'Failed to read image file',
      }));
    };
    reader.readAsDataURL(file);
  }, [validateField]);

  const handleImageDelete = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      preview: null,
      existingUrl: undefined,
      error: false,
      hasChanges: true,
      validationError: null,
    }));
  }, []);

  const resetImage = useCallback(() => {
    setImageState({
      preview: null,
      existingUrl: existingImageUrl,
      error: false,
      hasChanges: false,
      validationError: null,
    });
  }, [existingImageUrl]);

  return {
    imageState,
    handleImageSelect,
    handleImageDelete,
    resetImage,
  };
}