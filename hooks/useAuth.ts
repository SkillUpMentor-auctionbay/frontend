'use client';

import { authAPI } from '@/services/api';
import {
  AuthError,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types/auth';
import { clearToken, getToken, storeToken } from '@/utils/tokenValidation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

const handleAuthSuccess = (
  data: LoginResponse | RegisterResponse,
  queryClient: any,
  router: any,
) => {
  const tokenStored = storeToken(data.access_token);
  if (!tokenStored) {
    return;
  }

  queryClient.setQueryData(['user'], data.user);
  queryClient.invalidateQueries({ queryKey: ['user'], refetchType: 'active' });

  router.push('/auctions');
};

export function useAuthMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const activeOperation = useRef<'login' | 'register' | 'logout' | null>(null);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => {
      if (activeOperation.current) {
        return Promise.reject(
          new Error('Authentication operation already in progress'),
        );
      }
      activeOperation.current = 'login';
      return authAPI.login(data);
    },
    onSuccess: (data) => {
      handleAuthSuccess(data, queryClient, router);
      activeOperation.current = null;
    },
    onError: (error: AuthError) => {
      clearToken();
      queryClient.clear();
      activeOperation.current = null;
    },
    onSettled: () => {
      activeOperation.current = null;
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => {
      if (activeOperation.current) {
        return Promise.reject(
          new Error('Authentication operation already in progress'),
        );
      }
      activeOperation.current = 'register';
      return authAPI.register(data);
    },
    onSuccess: (data) => {
      handleAuthSuccess(data, queryClient, router);
      activeOperation.current = null;
    },
    onError: (error: AuthError) => {
      clearToken();
      queryClient.clear();
      activeOperation.current = null;
    },
    onSettled: () => {
      activeOperation.current = null;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      clearToken();
      queryClient.clear();
      router.push('/');
      activeOperation.current = null;
    },
    onError: (error: AuthError) => {
      clearToken();
      queryClient.clear();
      router.push('/');
      activeOperation.current = null;
    },
    onSettled: () => {
      activeOperation.current = null;
    },
  });

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const clearErrors = useRef(() => {
    loginMutation.reset();
    registerMutation.reset();
    logoutMutation.reset();
    activeOperation.current = null;
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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (hasToken) {
      queryClient.cancelQueries({ queryKey: ['user'] });
    }
  }, [hasToken, queryClient]);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | undefined, Error>({
    queryKey: ['user'],
    queryFn: authAPI.me,
    enabled: !!hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
    networkMode: 'online',
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
