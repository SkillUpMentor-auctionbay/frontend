"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { getProfilePictureUrl } from "@/lib/image-url";

export function useProfilePicture() {
  const { user } = useAuth();

  const profilePictureUrl = useMemo(() => {
    return getProfilePictureUrl(user?.profilePictureUrl);
  }, [user?.profilePictureUrl]);

  return {
    data: profilePictureUrl,
    isLoading: false,
    error: null,
    isSuccess: !!profilePictureUrl,
  };
}