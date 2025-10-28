/**
 * Utility functions for formatting error messages in a user-friendly way
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  validationErrors?: ValidationError[];
}

/**
 * Formats login errors into user-friendly messages
 */
export function formatLoginError(error: any): string {
  if (!error) return "An unexpected error occurred";

  // Handle network errors
  if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // Handle API response errors
  if (error.response?.data) {
    const data = error.response.data;

    // Handle validation errors with specific field details
    if (data.validationErrors && Array.isArray(data.validationErrors)) {
      const fieldErrors = data.validationErrors.map((validationError: ValidationError) => {
        const fieldName = formatFieldName(validationError.field);
        return `${fieldName}: ${validationError.message}`;
      });
      return fieldErrors.join(", ");
    }

    // Handle specific error messages
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

  // Handle generic errors
  if (error.message) {
    return error.message;
  }

  return "Login failed. Please try again.";
}

/**
 * Formats registration errors into user-friendly messages
 */
export function formatRegisterError(error: any): string {
  if (!error) return "An unexpected error occurred";

  // Handle network errors
  if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // Handle API response errors
  if (error.response?.data) {
    const data = error.response.data;

    // Handle validation errors with specific field details
    if (data.validationErrors && Array.isArray(data.validationErrors)) {
      const fieldErrors = data.validationErrors.map((validationError: ValidationError) => {
        const fieldName = formatFieldName(validationError.field);
        return `${fieldName}: ${validationError.message}`;
      });
      return fieldErrors.join(", ");
    }

    // Handle specific error messages
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

  // Handle generic errors
  if (error.message) {
    return error.message;
  }

  return "Registration failed. Please try again.";
}

/**
 * Formats field names to be more user-friendly
 */
function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: "First name",
    surname: "Last name",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    profilePictureUrl: "Profile picture",
    // Login-specific field mappings
    identifier: "Email address",
    credentials: "Credentials"
  };

  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Gets the main error message from API response
 */
export function getErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred";

  // Handle API response errors
  if (error.response?.data) {
    const data = error.response.data;
    return data.message || data.error || "An error occurred";
  }

  // Handle network errors
  if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
    return "Network error. Please check your connection.";
  }

  // Handle generic errors
  return error.message || "An error occurred";
}