'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useAuthMutation, useAuth as useAuthQuery } from '../hooks/useAuth';
import { AuthContextUser, AuthError } from '../types/auth';

interface AuthContextType {
  user: AuthContextUser;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    surname: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearErrors: () => void;
  isAuthenticated: boolean;
  loginError: AuthError | null;
  registerError: AuthError | null;
  logoutError: AuthError | null;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isAuthenticated, isLoading } = useAuthQuery();

  const {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    clearErrors: clearErrorsFromHook,
    loginError,
    registerError,
    logoutError,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
  } = useAuthMutation();

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      await loginMutation({ email, password });
    },
    [loginMutation],
  );

  const register = useCallback(
    async (
      name: string,
      surname: string,
      email: string,
      password: string,
    ): Promise<void> => {
      await registerMutation({ name, surname, email, password });
    },
    [registerMutation],
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation();
  }, [logoutMutation]);

  const clearErrors = useCallback(() => {
    clearErrorsFromHook();
  }, [clearErrorsFromHook]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      clearErrors,
      isAuthenticated: !!isAuthenticated,
      loginError,
      registerError,
      logoutError,
      isLoggingIn,
      isRegistering,
      isLoggingOut,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      clearErrors,
      isAuthenticated,
      loginError,
      registerError,
      logoutError,
      isLoggingIn,
      isRegistering,
      isLoggingOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
