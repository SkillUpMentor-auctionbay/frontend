import { AuctionError } from '@/types/auction';
import { AUCTION_VALIDATION } from '@/constants/validation';

export interface ValidationError {
  field: string;
  message: string;
}

export function formatLoginError(error: any): string {
  if (!error) return "An unexpected error occurred";

  if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  if (error.response?.data) {
    const data = error.response.data;

    if (data.validationErrors && Array.isArray(data.validationErrors)) {
      const fieldErrors = data.validationErrors.map((validationError: ValidationError) => {
        const fieldName = formatFieldName(validationError.field);
        return `${fieldName}: ${validationError.message}`;
      });
      return fieldErrors.join(", ");
    }

    switch (data.message) {
      case "Invalid credentials":
        return "Invalid email or password. Please check your credentials and try again.";
      case "User not found":
        return "No account found with this email address.";
      case "Password is incorrect":
        return "Incorrect password. Please try again.";
      case "Email not verified":
        return "Please verify your email address before logging in.";
      case "Account is locked":
        return "Your account has been locked. Please contact support.";
      case "Validation failed":
        return "Please check all fields and make sure they meet the requirements.";
      default:
        return data.message || "Login failed. Please try again.";
    }
  }

  if (error.message) {
    return error.message;
  }

  return "Login failed. Please try again.";
}

export function formatRegisterError(error: any): string {
  if (!error) return "An unexpected error occurred";

  if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  if (error.response?.data) {
    const data = error.response.data;

    if (data.validationErrors && Array.isArray(data.validationErrors)) {
      const fieldErrors = data.validationErrors.map((validationError: ValidationError) => {
        const fieldName = formatFieldName(validationError.field);
        return `${fieldName}: ${validationError.message}`;
      });
      return fieldErrors.join(", ");
    }

    switch (data.message) {
      case "Email already exists":
        return "An account with this email already exists. Please use a different email or try logging in.";
      case "User already exists":
        return "An account with this email already exists. Please use a different email or try logging in.";
      case "Invalid email format":
        return "Please enter a valid email address.";
      case "Password too weak":
        return "Password is too weak. Please choose a stronger password with at least 6 characters.";
      case "Validation failed":
        return "Please check all fields and make sure they meet the requirements.";
      default:
        return data.message || "Registration failed. Please try again.";
    }
  }

  if (error.message) {
    return error.message;
  }

  return "Registration failed. Please try again.";
}

function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: "First name",
    surname: "Last name",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    profilePictureUrl: "Profile picture",
    identifier: "Email address",
    credentials: "Credentials"
  };

  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
}


export function normalizeAuctionError(error: unknown): AuctionError {
  if (error && typeof error === 'object' && 'message' in error) {
    return error as AuctionError;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: AUCTION_VALIDATION.MESSAGES.GENERAL_ERROR,
    code: 'UNKNOWN_ERROR',
  };
}