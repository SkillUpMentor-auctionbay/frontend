"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";

export function useProfilePicture() {
  const { user } = useAuth();

  const profilePictureUrl = useMemo(() => {
    if (!user?.profilePictureUrl) {
      return null;
    }

    // If the profilePictureUrl is already a full URL (starts with http), use it as is
    if (user.profilePictureUrl.startsWith('http')) {
      return user.profilePictureUrl;
    }

    // If the profilePictureUrl already starts with /static/, just prepend the API base URL
    if (user.profilePictureUrl.startsWith('/static/')) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      return `${API_BASE_URL}${user.profilePictureUrl}`;
    }

    // Otherwise, it's just the filename, so construct the full URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    return `${API_BASE_URL}/static/profile-pictures/${user.profilePictureUrl}`;
  }, [user?.profilePictureUrl]);

  return {
    data: profilePictureUrl,
    isLoading: false,
    error: null,
    isSuccess: !!profilePictureUrl,
  };
}