export const AUCTION_VALIDATION = {
  TITLE: {
    MAX_LENGTH: 200,
  },
  DESCRIPTION: {
    MAX_LENGTH: 2000,
  },

  PRICE: {
    MAX_VALUE: 999999.99,
    MAX_DECIMAL_PLACES: 2,
  },

  IMAGE: {
    MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ] as const,
  },

  MESSAGES: {
    TITLE_REQUIRED: 'Title is required',
    TITLE_TOO_LONG: 'Title must be less than 200 characters',
    DESCRIPTION_REQUIRED: 'Description is required',
    DESCRIPTION_TOO_LONG: 'Description must be less than 2000 characters',
    PRICE_REQUIRED: 'Starting price is required',
    PRICE_INVALID: 'Starting price must be a valid number (e.g., 10.50)',
    PRICE_NOT_A_NUMBER: 'Starting price must be a valid number',
    PRICE_NON_POSITIVE: 'Starting price must be positive',
    PRICE_TOO_HIGH: 'Starting price must be less than 1,000,000',
    PRICE_TOO_MANY_DECIMALS: 'Starting price can have maximum 2 decimal places',
    END_DATE_REQUIRED: 'End date is required',
    END_DATE_INVALID: 'Use DD.MM.YYYY format (e.g., 10.12.2025)',
    END_DATE_PAST: 'End date must be in the future',
    IMAGE_TOO_LARGE: 'Image must be less than 5MB',
    IMAGE_INVALID_TYPE: 'Image must be in JPEG, JPG, PNG, or WebP format',
    GENERAL_ERROR: 'An unexpected error occurred while creating the auction',
    VALIDATION_FAILED: 'Validation failed',
    INVALID_DATE_FORMAT: 'Invalid date format. Please use DD.MM.YYYY format.',
    PROFILE_PICTURE_UPLOAD_FAILED: 'Failed to upload profile picture',
    UNKNOWN_ERROR: 'An unexpected error occurred',
  },
} as const;

export const VALIDATION_PATTERNS = {
  PRICE: /^-?\d*\.?\d*$/,
  DATE_FORMAT: /^(\d{2})\.(\d{2})\.(\d{4})$/,
} as const;
