"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authAPI } from "../services/api";
import { User, LoginRequest, RegisterRequest, LoginResponse, AuthError } from "../types/auth";
import { useCallback, useRef } from "react";
import { authDebug, checkAuthState } from "../utils/authDebug";
import { storeToken, clearToken, getToken } from "../utils/tokenValidation";

export function useAuthMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authAPI.login(data),
    onSuccess: (data, variables) => {
      console.log("🔍 Login success - API response:", data);
      console.log("🔍 Access token from response:", data.access_token);
      console.log("🔍 Access token type:", typeof data.access_token);

      // Validate and store token properly
      const tokenStored = storeToken(data.access_token);
      console.log("🔍 Token storage result:", tokenStored);

      if (!tokenStored) {
        console.error("❌ Critical: Failed to store token after successful login");
        console.error("❌ Token value that failed:", data.access_token);
        authDebug("Login success but invalid token received:", data.access_token);
        // Don't proceed if token storage failed
        return;
      }

      console.log("✅ Token stored successfully");
      console.log("🔍 User data from response:", data.user);

      // Update user data in query cache
      queryClient.setQueryData(["user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["user"], refetchType: "active" });

      console.log("✅ User data cached, redirecting to /auctions");

      router.push("/auctions");
    },
    onError: (error: AuthError) => {
      console.error("❌ Login mutation error:", error);
      authDebug("Login failed, clearing token");
      clearToken();
      queryClient.clear();
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: (data, variables) => {
      console.log("🔍 Register success - API response:", data);
      console.log("🔍 Access token from response:", data.access_token);
      console.log("🔍 Access token type:", typeof data.access_token);

      // Validate and store token properly
      const tokenStored = storeToken(data.access_token);
      console.log("🔍 Token storage result:", tokenStored);

      if (!tokenStored) {
        console.error("❌ Critical: Failed to store token after successful registration");
        console.error("❌ Token value that failed:", data.access_token);
        authDebug("Register success but invalid token received:", data.access_token);
        // Don't proceed if token storage failed
        return;
      }

      console.log("✅ Token stored successfully");
      console.log("🔍 User data from response:", data.user);

      // Update user data in query cache
      queryClient.setQueryData(["user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["user"], refetchType: "active" });

      console.log("✅ User data cached, redirecting to /auctions");

      router.push("/auctions");
    },
    onError: (error: AuthError) => {
      console.error("❌ Register mutation error:", error);
      authDebug("Registration failed, clearing token");
      clearToken();
      queryClient.clear();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      authDebug("Logout successful, clearing token");
      clearToken();

      queryClient.clear();

      router.push("/");
    },
    onError: (error: AuthError) => {
      authDebug("Logout failed, clearing token anyway");
      clearToken();
      queryClient.clear();
      router.push("/");
    },
  });

  const logout = useCallback(async () => {
    try {
      console.log("🔍 Starting logout process");
      await logoutMutation.mutateAsync();
      console.log("✅ Logout completed successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Re-throw the error so it can be handled by the caller
      throw error;
    }
  }, [logoutMutation]);

  // Create a stable clearErrors function that doesn't cause infinite loops
  const clearErrors = useRef(() => {
    loginMutation.reset();
    registerMutation.reset();
    logoutMutation.reset();
  }).current;

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    clearErrors,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
  };
}

export function useAuthQuery() {
  // Use proper token validation
  const hasToken = getToken();

  console.log("🔍 useAuthQuery - hasToken:", hasToken);
  console.log("🔍 useAuthQuery - hasToken type:", typeof hasToken);
  authDebug("useAuthQuery - hasToken:", hasToken);
  checkAuthState();

  const { data: user, isLoading, error } = useQuery<User | undefined, Error>({
    queryKey: ["user"],
    queryFn: authAPI.me,
    enabled: !!hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  console.log("🔍 useAuthQuery - user:", user);
  console.log("🔍 useAuthQuery - isLoading:", isLoading);
  console.log("🔍 useAuthQuery - error:", error);

  const isAuthenticated = !!user && !error && hasToken;

  console.log("🔍 useAuthQuery - isAuthenticated:", isAuthenticated);
  console.log("🔍 useAuthQuery - isAuthenticated calculation:", {
    user: !!user,
    error: !!error,
    hasToken: !!hasToken
  });

  authDebug("useAuthQuery - isAuthenticated:", isAuthenticated);
  authDebug("useAuthQuery - details:", { user: !!user, error: !!error, hasToken });

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
}

export function useAuth() {
  const {
    login,
    register,
    logout,
    clearErrors,
    loginError,
    registerError,
    logoutError,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
  } = useAuthMutation();

  const { user, isLoading, error } = useAuthQuery();

  const isAuthenticated = !!user && !error && !!getToken();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    clearErrors,
    loginError,
    registerError,
    logoutError,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
  };
}