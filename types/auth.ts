// Shared authentication types

export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  tokenVersion: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  access_token: string;
}

export interface UpdateUserProfileRequest {
  name: string;
  surname: string;
  email: string;
}

export interface UpdateUserProfileResponse {
  id: string;
  email: string;
  name: string;
  surname: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  tokenVersion: number;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

// Error types for better type safety
export interface AuthError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, any>;
}


export type AuthContextUser = User | null | undefined;