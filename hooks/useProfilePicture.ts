"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProfilePictureUrl, getProfilePictureUrlWithCacheBust } from "@/utils/imageUtils";

export function useProfilePicture() {
  const { user } = useAuth();
  const [forceRefresh, setForceRefresh] = useState(0);

  useEffect(() => {
    setForceRefresh(prev => prev + 1);
  }, [user?.profilePictureUrl]);

  const profilePictureUrl = useMemo(() => {
    if (user?.profilePictureUrl && forceRefresh > 0) {
      return getProfilePictureUrlWithCacheBust(user.profilePictureUrl);
    }
    return getProfilePictureUrl(user?.profilePictureUrl);
  }, [user?.profilePictureUrl, forceRefresh]);

  return {
    data: profilePictureUrl,
    isLoading: false,
    error: null,
    isSuccess: !!profilePictureUrl,
  };
}