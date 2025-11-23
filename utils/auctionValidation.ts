import { AuctionFormData, FormValidationErrors, EditAuctionFormData } from '@/types/auction';
import { createMidnightUTCDate } from './dateUtils';
import { AUCTION_VALIDATION, VALIDATION_PATTERNS } from '@/constants/validation';


export function validateAuctionForm(formData: AuctionFormData): FormValidationErrors {
  const errors: FormValidationErrors = {};

  if (!formData.title || formData.title.trim().length === 0) {
    errors.title = AUCTION_VALIDATION.MESSAGES.TITLE_REQUIRED;
  } else if (formData.title.trim().length > AUCTION_VALIDATION.TITLE.MAX_LENGTH) {
    errors.title = AUCTION_VALIDATION.MESSAGES.TITLE_TOO_LONG;
  }

  if (!formData.description || formData.description.trim().length === 0) {
    errors.description = AUCTION_VALIDATION.MESSAGES.DESCRIPTION_REQUIRED;
  } else if (formData.description.trim().length > AUCTION_VALIDATION.DESCRIPTION.MAX_LENGTH) {
    errors.description = AUCTION_VALIDATION.MESSAGES.DESCRIPTION_TOO_LONG;
  }

  if (!formData.startingPrice || formData.startingPrice.trim().length === 0) {
    errors.startingPrice = AUCTION_VALIDATION.MESSAGES.PRICE_REQUIRED;
  } else {
    const priceError = validatePrice(formData.startingPrice.trim());
    if (priceError) {
      errors.startingPrice = priceError;
    }
  }

  if (!formData.endDate || formData.endDate.trim().length === 0) {
    errors.endDate = AUCTION_VALIDATION.MESSAGES.END_DATE_REQUIRED;
  } else {
    const dateError = validateEndDate(formData.endDate.trim());
    if (dateError) {
      errors.endDate = dateError;
    }
  }

  if (formData.image) {
    const imageError = validateImage(formData.image);
    if (imageError) {
      errors.image = imageError;
    }
  }

  return errors;
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
  if (decimalPlaces && decimalPlaces.length > AUCTION_VALIDATION.PRICE.MAX_DECIMAL_PLACES) {
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

  const isValidType = AUCTION_VALIDATION.IMAGE.ALLOWED_TYPES.some(allowedType => allowedType === image.type);
  if (!isValidType) {
    return AUCTION_VALIDATION.MESSAGES.IMAGE_INVALID_TYPE;
  }

  return null;
}


export function validateEditAuctionForm(formData: EditAuctionFormData): FormValidationErrors {
  const errors: FormValidationErrors = {};

  if (!formData.title || formData.title.trim().length === 0) {
    errors.title = AUCTION_VALIDATION.MESSAGES.TITLE_REQUIRED;
  } else if (formData.title.trim().length > AUCTION_VALIDATION.TITLE.MAX_LENGTH) {
    errors.title = AUCTION_VALIDATION.MESSAGES.TITLE_TOO_LONG;
  }

  if (!formData.description || formData.description.trim().length === 0) {
    errors.description = AUCTION_VALIDATION.MESSAGES.DESCRIPTION_REQUIRED;
  } else if (formData.description.trim().length > AUCTION_VALIDATION.DESCRIPTION.MAX_LENGTH) {
    errors.description = AUCTION_VALIDATION.MESSAGES.DESCRIPTION_TOO_LONG;
  }

  if (!formData.endDate || formData.endDate.trim().length === 0) {
    errors.endDate = AUCTION_VALIDATION.MESSAGES.END_DATE_REQUIRED;
  } else {
    const dateError = validateEndDate(formData.endDate.trim());
    if (dateError) {
      errors.endDate = dateError;
    }
  }

  if (formData.image) {
    const imageError = validateImage(formData.image);
    if (imageError) {
      errors.image = imageError;
    }
  }

  return errors;
}

export function validateProfilePicture(image: File): string | null {
  const imageError = validateImage(image);
  if (imageError) {
    return imageError;
  }

  return null; 
}
