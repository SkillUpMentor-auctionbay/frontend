import {
  AUCTION_VALIDATION,
  VALIDATION_PATTERNS,
} from '@/constants/validation';
import {
  AuctionFormData,
  EditAuctionFormData,
  FormValidationErrors,
} from '@/types/auction';
import { createMidnightUTCDate } from '@/utils/dateUtils';
import { useCallback, useState } from 'react';

export function useAuctionValidation(mode: 'create' | 'edit') {
  const [hiddenValidationErrors, setHiddenValidationErrors] = useState<
    Set<string>
  >(new Set());

  const validateField = useCallback(
    (
      field: string,
      value: string,
      allData: AuctionFormData | EditAuctionFormData,
    ): string | null => {
      if (field === 'title') {
        if (!value || value.trim().length === 0) {
          return AUCTION_VALIDATION.MESSAGES.TITLE_REQUIRED;
        } else if (value.trim().length > AUCTION_VALIDATION.TITLE.MAX_LENGTH) {
          return AUCTION_VALIDATION.MESSAGES.TITLE_TOO_LONG;
        }
      }

      if (field === 'description') {
        if (!value || value.trim().length === 0) {
          return AUCTION_VALIDATION.MESSAGES.DESCRIPTION_REQUIRED;
        } else if (
          value.trim().length > AUCTION_VALIDATION.DESCRIPTION.MAX_LENGTH
        ) {
          return AUCTION_VALIDATION.MESSAGES.DESCRIPTION_TOO_LONG;
        }
      }

      if (field === 'startingPrice') {
        if (!value || value.trim().length === 0) {
          return AUCTION_VALIDATION.MESSAGES.PRICE_REQUIRED;
        } else {
          const priceError = validatePrice(value.trim());
          if (priceError) {
            return priceError;
          }
        }
      }

      if (field === 'endDate') {
        if (!value || value.trim().length === 0) {
          return AUCTION_VALIDATION.MESSAGES.END_DATE_REQUIRED;
        } else {
          const dateError = validateEndDate(value.trim());
          if (dateError) {
            return dateError;
          }
        }
      }

      return null;
    },
    [],
  );

  const validateEntireForm = useCallback(
    (formData: AuctionFormData | EditAuctionFormData): FormValidationErrors => {
      const errors: FormValidationErrors = {};

      const titleError = validateField('title', formData.title, formData);
      if (titleError && !hiddenValidationErrors.has('title')) {
        errors.title = titleError;
      }

      const descriptionError = validateField(
        'description',
        formData.description,
        formData,
      );
      if (descriptionError && !hiddenValidationErrors.has('description')) {
        errors.description = descriptionError;
      }

      const priceError = validateField(
        'startingPrice',
        formData.startingPrice,
        formData,
      );
      if (priceError && !hiddenValidationErrors.has('startingPrice')) {
        errors.startingPrice = priceError;
      }

      const dateError = validateField('endDate', formData.endDate, formData);
      if (dateError && !hiddenValidationErrors.has('endDate')) {
        errors.endDate = dateError;
      }

      if (formData.image && !hiddenValidationErrors.has('image')) {
        const imageError = validateImage(formData.image);
        if (imageError) {
          errors.image = imageError;
        }
      }

      return errors;
    },
    [validateField, hiddenValidationErrors],
  );

  const clearFieldError = useCallback((field: string) => {
    setHiddenValidationErrors((prev) => {
      const newSet = new Set(prev);
      newSet.add(field);
      return newSet;
    });
  }, []);

  const hasValidationErrors = useCallback(
    (formData: AuctionFormData | EditAuctionFormData): boolean => {
      const errors = validateEntireForm(formData);
      return Object.keys(errors).length > 0;
    },
    [validateEntireForm],
  );

  return {
    validateField,
    validateEntireForm,
    clearFieldError,
    hasValidationErrors,
    hiddenValidationErrors,
    setHiddenValidationErrors,
    validateImage,
  };
}

function validatePrice(priceStr: string): string | null {
  if (!VALIDATION_PATTERNS.PRICE.test(priceStr)) {
    return AUCTION_VALIDATION.MESSAGES.PRICE_INVALID;
  }

  const price = Number.parseFloat(priceStr);

  if (Number.isNaN(price)) {
    return AUCTION_VALIDATION.MESSAGES.PRICE_NOT_A_NUMBER;
  }

  if (price <= 0) {
    return AUCTION_VALIDATION.MESSAGES.PRICE_NON_POSITIVE;
  }

  if (price > AUCTION_VALIDATION.PRICE.MAX_VALUE) {
    return AUCTION_VALIDATION.MESSAGES.PRICE_TOO_HIGH;
  }

  const decimalPlaces = priceStr.split('.')[1];
  if (
    decimalPlaces &&
    decimalPlaces.length > AUCTION_VALIDATION.PRICE.MAX_DECIMAL_PLACES
  ) {
    return AUCTION_VALIDATION.MESSAGES.PRICE_TOO_MANY_DECIMALS;
  }

  return null;
}

function validateEndDate(dateString: string): string | null {
  const endDate = createMidnightUTCDate(dateString);

  if (!endDate) {
    return AUCTION_VALIDATION.MESSAGES.END_DATE_INVALID;
  }

  if (endDate <= new Date()) {
    return AUCTION_VALIDATION.MESSAGES.END_DATE_PAST;
  }

  return null;
}

function validateImage(image: File): string | null {
  if (image.size > AUCTION_VALIDATION.IMAGE.MAX_SIZE_BYTES) {
    return AUCTION_VALIDATION.MESSAGES.IMAGE_TOO_LARGE;
  }

  const isValidType = AUCTION_VALIDATION.IMAGE.ALLOWED_TYPES.some(
    (allowedType) => allowedType === image.type,
  );
  if (!isValidType) {
    return AUCTION_VALIDATION.MESSAGES.IMAGE_INVALID_TYPE;
  }

  return null;
}
