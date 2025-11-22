"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authAPI } from "../services/api";
import { User, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, AuthError } from "../types/auth";
import { useCallback, useRef } from "react";
import { storeToken, clearToken, getToken } from "../utils/tokenValidation";

const handleAuthSuccess = (
  data: LoginResponse | RegisterResponse,
  queryClient: any,
  router: any
) => {
  const tokenStored = storeToken(data.access_token);
  if (!tokenStored) {
    return;
  }

  queryClient.setQueryData(["user"], data.user);
  queryClient.invalidateQueries({ queryKey: ["user"], refetchType: "active" });

  router.push("/auctions");
};

export function useAuthMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authAPI.login(data),
    onSuccess: (data) => {
      handleAuthSuccess(data, queryClient, router);
    },
    onError: (error: AuthError) => {
      clearToken();
      queryClient.clear();
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: (data) => {
      handleAuthSuccess(data, queryClient, router);
    },
    onError: () => {
      clearToken();
      queryClient.clear();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      clearToken();
      queryClient.clear();
      router.push("/");
    },
    onError: () => {
      clearToken();
      queryClient.clear();
      router.push("/");
    },
  });

  
  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  
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
  const hasToken = getToken();

  const { data: user, isLoading, error } = useQuery<User | undefined, Error>({
    queryKey: ["user"],
    queryFn: authAPI.me,
    enabled: !!hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isAuthenticated = !!user && !error && hasToken;

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