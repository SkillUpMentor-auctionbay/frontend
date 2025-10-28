/**
 * Token validation utilities
 */

/**
 * Validates if a token is a valid JWT string
 * @param token - Token to validate
 * @returns boolean - True if token is valid JWT string
 */
export function isValidToken(token: string | null | undefined): boolean {
  console.log("🔍 Validating token:", token);

  if (!token || typeof token !== "string") {
    console.log("❌ Invalid token type or empty token");
    return false;
  }

  // Check for common invalid values
  if (token === "undefined" || token === "null" || token.trim() === "") {
    console.log("❌ Token has invalid placeholder value");
    return false;
  }

  // Basic JWT structure check: header.payload.signature
  const parts = token.split('.');
  console.log("🔍 Token parts count:", parts.length);

  if (parts.length !== 3) {
    console.log("❌ Token doesn't have JWT structure (expected 3 parts)");
    return false;
  }

  // Try to decode the payload to see if it's valid JSON
  try {
    const payload = JSON.parse(atob(parts[1]));
    console.log("✅ Token payload decoded successfully:", payload);

    // Be more lenient - just check if payload has basic structure
    // For now, accept any valid JWT structure without strict field requirements
    if (payload && typeof payload === 'object') {
      console.log("✅ Token appears to be valid JWT");
      return true;
    }

    console.log("❌ Token payload is not a valid object");
    return false;
  } catch (error) {
    console.log("❌ Failed to decode token payload:", error);
    return false;
  }
}

/**
 * Safely stores a token in localStorage with validation
 * @param token - Token to store
 * @returns boolean - True if token was stored successfully
 */
export function storeToken(token: string | null | undefined): boolean {
  console.log("🔍 Attempting to store token:", token);

  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    console.log("❌ Not in browser environment, cannot store token");
    return false;
  }

  try {
    // Remove any existing token first
    console.log("🔍 Removing existing token from localStorage");
    localStorage.removeItem("token");

    // Validate token before storing
    console.log("🔍 Validating token before storage");
    if (!isValidToken(token)) {
      console.error("❌ Token validation failed, not storing");
      return false;
    }

    // Store valid token
    if (token) {
      console.log("🔍 Storing token in localStorage");
      localStorage.setItem("token", token);

      // Verify it was stored correctly
      const storedToken = localStorage.getItem("token");
      if (storedToken === token) {
        console.log("✅ Token stored and verified successfully");
        return true;
      } else {
        console.error("❌ Token storage verification failed");
        return false;
      }
    }
  } catch (error) {
    console.error("❌ Error storing token in localStorage:", error);
    return false;
  }

  return false;
}

/**
 * Safely removes token from localStorage
 */
export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

/**
 * Gets token from localStorage with validation
 * @returns string | null - Valid token or null
 */
export function getToken(): string | null {
  console.log("🔍 Getting token from localStorage");

  if (typeof window === "undefined") {
    console.log("❌ Not in browser environment, cannot get token");
    return null;
  }

  const token = localStorage.getItem("token");
  console.log("🔍 Raw token from localStorage:", token);

  // Validate token before returning
  if (isValidToken(token)) {
    console.log("✅ Token is valid, returning it");
    return token;
  }

  console.log("❌ Token is invalid, removing from localStorage");
  // Remove invalid token
  localStorage.removeItem("token");
  return null;
}